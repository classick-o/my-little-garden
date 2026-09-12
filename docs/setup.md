# Configurare conturi si servicii

Pasii pe care trebuie sa ii faci tu, **in ordinea asta**. Ordinea conteaza: fiecare pas
produce o valoare de care are nevoie urmatorul. Dureaza in jur de 40 de minute.

Porneste prin a copia sablonul de variabile:

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
4. Din **Project Settings -> API** (sau **API Keys**, in interfata noua) copiaza in
   `.env.local`:

   | Din dashboard | In `.env.local` |
   |---|---|
   | Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
   | cheia publica (`anon` sau `sb_publishable_...`) | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
   | cheia secreta (`service_role` sau `sb_secret_...`) | `SUPABASE_SERVICE_ROLE_KEY` |

5. Noteaza-ti si **Project Reference ID** din **Project Settings -> General**.
   Arata ca `abcdefghijklmnop`. Il folosesti la pasul 3.

> Cheia secreta **ocoleste complet Row Level Security**. Sta doar pe server, niciodata
> intr-o variabila `NEXT_PUBLIC_*`.

---

## 2. Vercel — primul deploy

Il facem **acum**, inaintea lui Google, fiindca de aici afli domeniul aplicatiei.
Aplicatia se construieste si fara nicio cheie, deci primul deploy merge din prima.

1. [vercel.com/new](https://vercel.com/new) -> **Import Git Repository**.
2. Daca nu e deja legat, conecteaza contul de GitHub si autorizeaza accesul la
   `classick-o/my-little-garden`.
3. Framework Preset: **Next.js**, detectat automat. Nu schimba comenzile de build.
4. **Nu adauga inca variabile de mediu.** Apasa **Deploy**.
5. Noteaza domeniul rezultat.

> **Starea actuala a proiectului:**
> proiectul Vercel exista deja (`my-little-garden`), toate variabilele de mediu sunt
> setate, iar domeniul atribuit este:
>
> ```
> https://my-little-garden-seven.vercel.app
> ```
>
> Mai lipseste doar legarea de GitHub, din **Connect Git Repository** in dashboard.

### Regiunea

Repo-ul contine un `vercel.json` care cere regiunea `fra1` (Frankfurt), ca sa fie langa
baza de date. Daca planul tau nu permite alegerea regiunii din fisier, seteaz-o din
**Project Settings -> Functions -> Region**. Fara asta, fiecare interogare face un drum
pana in Statele Unite si inapoi.

---

## 3. Google OAuth

### 3a. Proiect si ecran de consimtamant

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

### 3b. Client OAuth

1. **APIs & Services -> Credentials -> Create Credentials -> OAuth client ID**
2. Application type: **Web application**
3. **Authorized JavaScript origins** — domeniul aplicatiei, de la pasul 2:
   ```
   http://localhost:3000
   https://my-little-garden-seven.vercel.app
   ```
4. **Authorized redirect URIs** — aici merge URL-ul Supabase, nu al aplicatiei:
   ```
   https://bnzzfxqsjztfjxdfqifx.supabase.co/auth/v1/callback
   ```
5. Copiaza **Client ID** si **Client secret**.

### 3c. Leaga-le de Supabase

1. In Supabase: **Authentication -> Sign In / Providers -> Google** -> activeaza.
2. Lipeste Client ID si Client Secret. Salveaza.
3. **Authentication -> URL Configuration**:
   * **Site URL**: `https://my-little-garden-seven.vercel.app`
   * **Redirect URLs**: adauga si `http://localhost:3000/**`

---

## 4. Gemini

1. [aistudio.google.com/apikey](https://aistudio.google.com/apikey) -> **Create API key**.
   Poti folosi acelasi proiect Google Cloud.
2. Pune cheia in `.env.local` la `GEMINI_API_KEY`.

Cheia sta **numai pe server**. Niciodata intr-o variabila `NEXT_PUBLIC_*`.

### Ce model foloseste aplicatia

Implicit `gemini-3.5-flash`. Ca sa vezi ce modele accepta cheia ta:

```bash
npm run models
```

Ca sa folosesti altul, completeaza `GEMINI_MODEL` in `.env.local`. Lasat gol, se
foloseste cel implicit.

Dupa orice schimbare de model sau de prompt, verifica rezultatul cu o cerere reala:

```bash
npm run smoke:ai
```

Comanda descarca o poza de test, cere identificarea si verifica raspunsul — inclusiv
faptul ca e in romana fara diacritice. Nu ruleaza in CI, ca sa nu consume cota.

---

## 5. Chei generate local

Cheile pentru notificari si secretul de cron nu se iau de nicaieri, se genereaza:

```bash
npm run secrets
```

Comanda scrie direct in `.env.local` si nu atinge valorile deja completate.

> Notificarile pe iPhone functioneaza **doar** din iOS 16.4+ si **doar** daca aplicatia e
> adaugata pe ecranul principal. Din Safari obisnuit nu ajunge nimic.

---

## 6. Variabilele in Vercel

Acum ca `.env.local` e complet, muta aceleasi valori in Vercel:
**Project Settings -> Environment Variables**.

Adauga tot ce e in `.env.local`, cu o singura diferenta:

| Variabila | Valoare in Vercel |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://my-little-garden-seven.vercel.app`, nu `localhost` |

Restul se copiaza identic. `DB_PASS` nu e folosit de aplicatie — parola bazei de date
merge doar in GitHub Secrets, la pasul urmator.

Dupa ce le-ai adaugat, declanseaza un **Redeploy**: variabilele nu se aplica retroactiv
deployment-ului existent.

---

## 7. GitHub Secrets si migratiile

**Settings -> Secrets and variables -> Actions -> New repository secret**:

| Secret | De unde |
|---|---|
| `SUPABASE_ACCESS_TOKEN` | [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens) |
| `SUPABASE_PROJECT_REF` | Project Settings -> General |
| `SUPABASE_DB_PASSWORD` | parola aleasa la pasul 1 |

Apoi intra in tab-ul **Actions**, alege **Migratii Supabase** si apasa **Run workflow**.
Asta creeaza schema in proiectul tau.

La fiecare schimbare de schema comisa in `main`, workflow-ul ruleaza singur.

---

## 8. Lista de acces

Aplicatia e privata. Verificarea sta **in baza de date**, nu in aplicatie, ca sa nu poata
fi ocolita: un trigger pe `auth.users` respinge inregistrarea oricarei adrese care nu e in
tabelul `public.allowed_emails`.

Dupa ce migratiile au rulat, intra in Supabase la **SQL Editor** si ruleaza:

```sql
insert into public.allowed_emails (email, note) values
  ('adresa-ei@gmail.com', 'ea'),
  ('adresa-ta@gmail.com', 'eu');
```

Ca sa dai acces cuiva mai tarziu, adaugi o linie aici. Ca sa il retragi, o stergi —
contul existent ramane, dar unul nou nu se mai poate crea.

---

## Verificare

Local:

```bash
npm run dev
```

In productie: deschide domeniul de pe Vercel de pe telefon si adauga aplicatia pe ecranul
principal. Daca porneste si te poti autentifica cu Google, configurarea e completa.
