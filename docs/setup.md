# Configurare conturi si servicii

Pasii pe care trebuie sa ii faci tu, in ordinea asta. Dureaza in jur de 30 de minute.

Dupa fiecare sectiune ai de copiat niste valori in `.env.local`. Porneste prin a copia
sablonul:

```bash
cp .env.example .env.local
```

`.env.local` este ignorat de git si nu ajunge niciodata in repo.

> **Nu trimite niciodata cheile in chat.** Le pui direct in `.env.local`, in Vercel si in
> GitHub Secrets. Daca o cheie ajunge accidental intr-un loc public, regenereaz-o.

---

## 1. Supabase

1. Intra pe [supabase.com/dashboard](https://supabase.com/dashboard) si apasa **New project**.
2. Completeaza:
   * **Name**: `my-little-garden`
   * **Database Password**: genereaza una si **salveaz-o** (o folosim la migratii)
   * **Region**: `Central EU (Frankfurt)` — cea mai apropiata de Romania
3. Asteapta ~2 minute sa se provizioneze.
4. Mergi la **Project Settings -> API** si copiaza in `.env.local`:

   | Din dashboard | In `.env.local` |
   |---|---|
   | Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
   | `anon` `public` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
   | `service_role` `secret` | `SUPABASE_SERVICE_ROLE_KEY` |

5. Noteaza-ti si **Project Reference ID** (din **Project Settings -> General**).
   Arata ca `abcdefghijklmnop`. Il folosim la pasul urmator.

> Cheia `service_role` **ocoleste complet Row Level Security**. Sta doar pe server,
> niciodata intr-o variabila `NEXT_PUBLIC_*`.

---

## 2. Google OAuth

### 2a. Proiect si ecran de consimtamant

1. [console.cloud.google.com](https://console.cloud.google.com) -> creeaza un proiect nou,
   `My little garden`.
2. **APIs & Services -> OAuth consent screen**:
   * User type: **External**
   * App name: `My little garden`
   * User support email si Developer contact: adresa ta
3. La **Scopes** adauga: `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`.
4. La **Test users** adauga adresa ei de Gmail si pe a ta.

   Aplicatia ramane in modul **Testing**. E suficient: permite pana la 100 de utilizatori
   si nu necesita verificare de la Google.

### 2b. Client OAuth

1. **APIs & Services -> Credentials -> Create Credentials -> OAuth client ID**
2. Application type: **Web application**
3. **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   https://<domeniul-tau>.vercel.app
   ```
4. **Authorized redirect URIs** — aici merge URL-ul Supabase, nu al aplicatiei:
   ```
   https://<project-ref>.supabase.co/auth/v1/callback
   ```
5. Copiaza **Client ID** si **Client secret**.

### 2c. Leaga-le de Supabase

1. In Supabase: **Authentication -> Sign In / Providers -> Google** -> activeaza.
2. Lipeste Client ID si Client Secret. Salveaza.
3. **Authentication -> URL Configuration**:
   * **Site URL**: `https://<domeniul-tau>.vercel.app`
   * **Redirect URLs**: adauga si `http://localhost:3000/**`

---

## 3. Gemini

1. [aistudio.google.com/apikey](https://aistudio.google.com/apikey) -> **Create API key**.
   Poti folosi acelasi proiect Google Cloud de mai sus.
2. Pune cheia in `.env.local` la `GEMINI_API_KEY`.

Cheia sta **numai pe server**. Nu o pune niciodata intr-o variabila `NEXT_PUBLIC_*`.

---

## 4. Lista de acces

Aplicatia e privata. Verificarea sta **in baza de date**, nu in aplicatie, ca sa nu poata
fi ocolita: un trigger pe `auth.users` respinge inregistrarea oricarei adrese care nu e in
tabelul `public.allowed_emails`.

Dupa ce migratiile au fost aplicate (vezi pasul 7), intra in Supabase la **SQL Editor** si
ruleaza:

```sql
insert into public.allowed_emails (email, note) values
  ('adresa-ei@gmail.com', 'ea'),
  ('adresa-ta@gmail.com', 'eu');
```

Ca sa dai acces cuiva mai tarziu, adaugi o linie aici. Ca sa il retragi, o stergi -
contul existent ramane, dar unul nou nu se mai poate crea.

---

## 5. Chei pentru notificari

Genereaza perechea VAPID:

```bash
npx web-push generate-vapid-keys
```

Pune rezultatul in `.env.local`:

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<Public Key>
VAPID_PRIVATE_KEY=<Private Key>
VAPID_SUBJECT=mailto:adresa-ta@gmail.com
```

Si un secret care protejeaza ruta de cron:

```bash
openssl rand -hex 32
```

-> `CRON_SECRET`

> Notificarile pe iPhone functioneaza **doar** din iOS 16.4+ si **doar** daca aplicatia e
> adaugata pe ecranul principal. Din Safari obisnuit nu ajunge nimic.

---

## 6. Vercel

1. [vercel.com/new](https://vercel.com/new) -> **Import Git Repository**.
2. Daca nu e deja legat, conecteaza contul de GitHub si autorizeaza accesul la
   `classick-o/my-little-garden`.
3. Framework Preset: **Next.js** (se detecteaza singur). Nu schimba nimic la build.
4. Inainte de primul deploy, la **Environment Variables**, adauga tot ce e in `.env.local`
   **fara** `NEXT_PUBLIC_SITE_URL` (pe care il setezi la domeniul de productie).
5. Deploy. Noteaza domeniul rezultat si intoarce-te sa il pui la:
   * `NEXT_PUBLIC_SITE_URL` in Vercel
   * Authorized JavaScript origins in Google Cloud (pasul 2b)
   * Site URL in Supabase (pasul 2c)

---

## 7. GitHub Secrets

**Settings -> Secrets and variables -> Actions -> New repository secret**:

| Secret | De unde |
|---|---|
| `SUPABASE_ACCESS_TOKEN` | supabase.com/dashboard/account/tokens |
| `SUPABASE_PROJECT_REF` | Project Settings -> General |
| `SUPABASE_DB_PASSWORD` | parola aleasa la pasul 1 |

Dupa ce le-ai adaugat, intra in tab-ul **Actions**, alege **Migratii Supabase** si apasa
**Run workflow**. Asta creeaza schema in proiectul tau. La fiecare schimbare de schema
comisa in `main`, workflow-ul ruleaza singur.

---

## Verificare

```bash
npm run dev
```

Deschide `http://localhost:3000`. Daca aplicatia porneste si te poti autentifica,
configurarea e completa.
