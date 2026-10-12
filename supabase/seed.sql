-- Date de pornire pentru baza locala.
--
-- Se aplica numai la `supabase db reset` pe stack-ul local. Nu ajunge
-- niciodata in productie: acolo migratiile sunt singurele care ruleaza.
--
-- Lista de acces trebuie sa aiba cel putin o adresa, altfel declansatorul de
-- pe `auth.users` refuza orice cont si nu se poate intra nici macar local.
-- Adresa e una inventata, de dezvoltare: adresele reale nu au ce cauta in repo.

insert into public.allowed_emails (email, note)
values ('dev@local.test', 'Cont de dezvoltare locala')
on conflict (email) do nothing;
