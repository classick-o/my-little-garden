-- ===========================================================================
-- My little garden - schema initiala (V1)
--
-- Acopera scopul V1 din first-context.md sectiunea 72:
--   autentificare, gradina, adaugare planta, detaliu planta, udare, poze,
--   jurnal, identificare AI.
--
-- Descoperirile, chat-ul si realizarile sunt V1.5 si vor veni in migratii
-- separate (sectiunea 73). Nu cream tabele inainte sa avem nevoie de ele
-- (sectiunea 50).
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- Tipuri
-- ---------------------------------------------------------------------------

-- Cat de multa lumina primeste planta. Textul descriptiv de la AI se pastreaza
-- separat, in plants.care; aici tinem doar valoarea pe care o putem filtra.
create type public.sunlight_level as enum (
  'low',
  'medium',
  'bright_indirect',
  'direct'
);

-- Istoria plantei e bazata pe evenimente, nu pe cate un tabel per actiune
-- (sectiunea 19). Valori noi se adauga cu: alter type ... add value.
create type public.plant_event_type as enum (
  'created',
  'watered',
  'photo_added',
  'note_added',
  'fertilized',
  'repotted',
  'pruned',
  'moved',
  'ai_analysis'
);

create type public.ai_analysis_type as enum (
  'identification',
  'health',
  'care'
);


-- ---------------------------------------------------------------------------
-- Utilitare
-- ---------------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.touch_updated_at is
  'Trigger: actualizeaza updated_at la fiecare UPDATE.';


-- ---------------------------------------------------------------------------
-- Lista de acces
--
-- Aplicatia e privata. Oricine are cont Google poate ajunge la ecranul de
-- login, dar contul se creeaza doar daca adresa e in lista de mai jos.
-- Verificarea sta in baza de date, nu in aplicatie, ca sa nu poata fi ocolita.
--
-- Adresele se adauga manual din SQL Editor - vezi docs/setup.md.
-- ---------------------------------------------------------------------------

create table public.allowed_emails (
  email text primary key,
  note text,
  created_at timestamptz not null default now()
);

comment on table public.allowed_emails is
  'Adresele care au voie sa isi creeze cont. Se completeaza manual.';

alter table public.allowed_emails enable row level security;
-- Intentionat fara politici: nimeni nu citeste tabelul prin API.
-- Trigger-ul de mai jos il citeste ca security definer.


create or replace function public.enforce_allowed_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.allowed_emails
    where lower(email) = lower(new.email)
  ) then
    raise exception 'Adresa % nu are acces la aceasta aplicatie.', new.email
      using errcode = 'insufficient_privilege';
  end if;

  return new;
end;
$$;

create trigger enforce_allowed_email
  before insert on auth.users
  for each row
  execute function public.enforce_allowed_email();


-- ---------------------------------------------------------------------------
-- Profiluri
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  -- "Cum sa numim gradina ta?" din onboarding (sectiunea 49).
  garden_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profil propriu: citire"
  on public.profiles for select
  using ((select auth.uid()) = id);

create policy "profil propriu: modificare"
  on public.profiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create trigger touch_profiles
  before update on public.profiles
  for each row execute function public.touch_updated_at();


-- Profilul se creeaza automat la inregistrare, ca aplicatia sa nu trebuiasca
-- sa trateze cazul "utilizator fara profil".
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();


-- ---------------------------------------------------------------------------
-- Plante
-- ---------------------------------------------------------------------------

create table public.plants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,

  -- Numele personal ("Luna") si specia ("Monstera deliciosa") sunt doua
  -- lucruri diferite (sectiunea 15).
  name text not null check (length(trim(name)) between 1 and 60),
  species text check (length(species) <= 120),
  description text check (length(description) <= 2000),

  location text check (length(location) <= 80),
  sunlight public.sunlight_level,

  -- Programul de udare. Numarul de zile conduce memento-urile; sfaturile in
  -- cuvinte primite de la AI stau in `care`, ca sa nu amestecam logica
  -- deterministica cu text generat (sectiunea 70).
  watering_interval_days smallint not null default 7
    check (watering_interval_days between 1 and 365),
  last_watered_at timestamptz,

  -- Sfaturi de ingrijire: { light, watering, humidity, temperature }.
  care jsonb not null default '{}'::jsonb,

  -- Poza afisata pe card. Cheia straina se adauga mai jos, dupa ce exista
  -- tabelul de poze.
  cover_photo_id uuid,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.plants.watering_interval_days is
  'La cate zile se uda. next_watering_at se calculeaza, nu se stocheaza.';

alter table public.plants enable row level security;

create policy "plante proprii: citire"
  on public.plants for select
  using ((select auth.uid()) = user_id);

create policy "plante proprii: adaugare"
  on public.plants for insert
  with check ((select auth.uid()) = user_id);

create policy "plante proprii: modificare"
  on public.plants for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "plante proprii: stergere"
  on public.plants for delete
  using ((select auth.uid()) = user_id);

create index plants_user_created_idx
  on public.plants (user_id, created_at desc);

create trigger touch_plants
  before update on public.plants
  for each row execute function public.touch_updated_at();


-- ---------------------------------------------------------------------------
-- Poze
--
-- Pastram doua variante pe poza: una optimizata pentru afisare si una mica
-- pentru carduri (sectiunea 23). Transformarile de imagine din Supabase sunt
-- platite, deci variantele se genereaza in browser inainte de incarcare.
-- ---------------------------------------------------------------------------

create table public.plant_photos (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid not null references public.plants (id) on delete cascade,
  -- Duplicat intentionat: simplifica RLS si politicile de Storage.
  user_id uuid not null references auth.users (id) on delete cascade,

  storage_path text not null,
  thumbnail_path text,
  width integer,
  height integer,

  created_at timestamptz not null default now()
);

alter table public.plant_photos enable row level security;

create policy "poze proprii: citire"
  on public.plant_photos for select
  using ((select auth.uid()) = user_id);

create policy "poze proprii: adaugare"
  on public.plant_photos for insert
  with check ((select auth.uid()) = user_id);

create policy "poze proprii: stergere"
  on public.plant_photos for delete
  using ((select auth.uid()) = user_id);

create index plant_photos_plant_created_idx
  on public.plant_photos (plant_id, created_at desc);


-- Acum ca exista tabelul de poze, putem lega poza de coperta.
alter table public.plants
  add constraint plants_cover_photo_id_fkey
  foreign key (cover_photo_id)
  references public.plant_photos (id)
  on delete set null;


-- ---------------------------------------------------------------------------
-- Evenimente
--
-- Un singur tabel pentru toata istoria plantei (sectiunea 19). Alimenteaza
-- ecranul de detaliu si Jurnalul.
-- ---------------------------------------------------------------------------

create table public.plant_events (
  id uuid primary key default gen_random_uuid(),
  -- Nul pentru evenimente care privesc gradina, nu o planta anume.
  plant_id uuid references public.plants (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,

  type public.plant_event_type not null,
  -- Detalii specifice tipului: textul notei, id-ul pozei, locul de unde a fost
  -- mutata planta etc.
  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

alter table public.plant_events enable row level security;

create policy "evenimente proprii: citire"
  on public.plant_events for select
  using ((select auth.uid()) = user_id);

create policy "evenimente proprii: adaugare"
  on public.plant_events for insert
  with check ((select auth.uid()) = user_id);

create policy "evenimente proprii: stergere"
  on public.plant_events for delete
  using ((select auth.uid()) = user_id);

-- Jurnalul: toate evenimentele utilizatorului, cronologic invers.
create index plant_events_user_created_idx
  on public.plant_events (user_id, created_at desc);

-- Activitatea recenta a unei plante.
create index plant_events_plant_created_idx
  on public.plant_events (plant_id, created_at desc);


-- ---------------------------------------------------------------------------
-- Analize AI
--
-- Tinute separat de plante, ca istoricul sa ramana auditabil si sa putem
-- compara rezultate intre modele si versiuni de prompt (sectiunile 54, 55).
-- ---------------------------------------------------------------------------

create table public.plant_ai_analysis (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid references public.plants (id) on delete cascade,
  photo_id uuid references public.plant_photos (id) on delete set null,
  user_id uuid not null references auth.users (id) on delete cascade,

  analysis_type public.ai_analysis_type not null,
  -- Raspunsul validat. Nu se scrie nimic aici inainte de validare
  -- (sectiunile 17, 25).
  result jsonb not null,
  confidence real check (confidence between 0 and 1),

  model text not null,
  prompt_version text not null,

  created_at timestamptz not null default now()
);

alter table public.plant_ai_analysis enable row level security;

create policy "analize proprii: citire"
  on public.plant_ai_analysis for select
  using ((select auth.uid()) = user_id);

create policy "analize proprii: adaugare"
  on public.plant_ai_analysis for insert
  with check ((select auth.uid()) = user_id);

create index plant_ai_analysis_plant_created_idx
  on public.plant_ai_analysis (plant_id, created_at desc);


-- ---------------------------------------------------------------------------
-- Storage
--
-- Bucket privat. Calea incepe intotdeauna cu id-ul utilizatorului:
--   {user_id}/{plant_id}/{uuid}.webp
-- Politicile verifica primul segment, deci nimeni nu ajunge la fisierele
-- altcuiva (sectiunea 52).
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'plant-photos',
  'plant-photos',
  false,
  5242880, -- 5 MB; pozele sunt oricum micsorate inainte de incarcare
  array['image/webp', 'image/jpeg', 'image/png']
)
on conflict (id) do nothing;

create policy "poze: citire proprie"
  on storage.objects for select
  using (
    bucket_id = 'plant-photos'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

create policy "poze: incarcare proprie"
  on storage.objects for insert
  with check (
    bucket_id = 'plant-photos'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

create policy "poze: stergere proprie"
  on storage.objects for delete
  using (
    bucket_id = 'plant-photos'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );
