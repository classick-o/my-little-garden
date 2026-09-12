# My little garden — reguli de lucru

## Sursa de adevar

[first-context.md](first-context.md) este **documentul principal de context** al proiectului.
Citeste-l inainte de a implementa sau modifica orice feature.

Acest fisier (`CLAUDE.md`) nu il inlocuieste. El:
1. inregistreaza deciziile luate impreuna cu proprietarul proiectului
2. mapeaza sectiunile scrise pentru Flutter din `first-context.md` pe stack-ul real (Next.js)

Unde acest fisier contrazice `first-context.md`, **acest fisier castiga** — dar numai pentru
punctele listate explicit mai jos. Pentru tot restul, `first-context.md` ramane obligatoriu.

---

## 1. Produs

| | |
|---|---|
| Nume | **My little garden** (brand in engleza, nu se traduce) |
| Utilizatori | Privat — o singura persoana. Acces prin **allow-list pe email**. |
| Platforma tinta | iPhone, Safari, PWA instalat pe Home Screen |
| Viewport principal | 390–430px |

## 2. Limba

**Tot textul vizibil pentru utilizator este in romana, fara diacritice.**

Se aplica la:
* interfata (butoane, titluri, etichete, stari goale, mesaje de eroare)
* copy-ul de onboarding
* **raspunsurile AI-ului** — promptul trebuie sa ceara explicit romana fara diacritice
* notificari push

Nu se traduc: numele de brand „My little garden", numele stiintifice ale plantelor
(`Monstera deliciosa`), termenii tehnici din cod.

Numele de variabile, functii, tabele, rute si mesajele de commit raman in **engleza**.
Comentariile din cod si documentatia interna se scriu in **romana fara diacritice**,
ca sa fie citibile de proprietarul proiectului.

Exemple de ton (vezi si sectiunile 88–90 din `first-context.md`):

```
Buna seara
Gradina ta mica
Uda planta
Descopera o planta
Intreaba asistentul
Gradina ta te asteapta
Gata. Luna e fericita
```

## 3. Stack — inlocuieste sectiunile 4, 56, 57, 58 din first-context.md

| Strat | Tehnologie |
|---|---|
| Frontend | Next.js (App Router) + React + TypeScript |
| Stilizare | Tailwind CSS |
| Hosting | Vercel (domeniu implicit `*.vercel.app`) |
| Backend | Supabase — Postgres, Auth, Storage, RLS |
| Auth | Google OAuth via Supabase Auth |
| AI | Gemini, apelat **exclusiv** din Route Handlers Next.js |
| Notificari | Web Push (VAPID) + service worker |
| Medii | **Unul singur** (productie). Migratiile se aplica automat pe `main`. |

### Supabase Edge Functions — nu se folosesc

Sectiunea 67 din `first-context.md` cerea Edge Functions pentru ca frontend-ul Flutter
nu avea server propriu. Next.js are. Logica AI sta in Route Handlers pe Vercel.

Cerinta reala — **secretele nu ajung niciodata in browser** — ramane obligatorie.

### Straturi

```
Server Component / Client Component
        v
hook / server action
        v
repository            <- singurul loc care vorbeste cu Supabase
        v
Supabase
```

Pentru AI:

```
UI  ->  Route Handler (server)  ->  AIService  ->  Gemini  ->  validare  ->  Supabase
```

Interzis: apeluri Supabase sau `fetch` direct din componente de prezentare.

## 4. Notificari — constrangeri reale

* Web Push pe iOS functioneaza **numai** pe iOS 16.4+ **si numai** cu aplicatia instalata
  pe Home Screen. Din Safari obisnuit nu functioneaza deloc.
* Onboarding-ul trebuie sa ghideze explicit „Adauga pe ecranul principal", altfel
  utilizatorul nu primeste nimic si nu intelege de ce.
* Cererea de permisiune trebuie declansata de o actiune a utilizatorului, niciodata automat.
* Trimiterea se face dintr-un cron. Vercel Hobby permite **o rulare pe zi** — suficient
  pentru sumarul de dimineata. Pentru frecventa mai mare se muta pe `pg_cron` in Supabase.
* Sectiunea 43 ramane valabila: fara spam.

## 4b. Asset-uri vizuale

Imaginile, ilustratiile si iconitele aplicatiei se genereaza cu **MCP-ul 3D AI Studio**,
nu cu scripturi locale si nu luate de pe internet.

Se aplica la: iconite, ilustratii pentru starile goale, imagini de fundal, poze de
substituire pentru demonstratii, orice grafica de produs.

Rezultatele se salveaza in `public/` si se comit in repo, ca sa nu depindem de un
serviciu extern la rulare.

Nu se aplica la pozele plantelor facute de utilizator - acelea vin din camera si ajung
in Supabase Storage.

## 5. Tema

**Doar intunecata.** Nu exista tema luminoasa.

Verde profund ca fundal (`#13402a`), carduri de sticla translucide, verde viu (`#4ade80`)
ca accent, text alb. Lumina din fundal vine din componenta `Backdrop`, nu dintr-o culoare
plata - fara ea verdele arata mort.

Tokenurile sunt in `src/app/globals.css`. Foloseste utilitarul `glass` pentru carduri.

### Costul acestei alegeri

Pe fundal inchis, orice text alb asezat peste o fotografie cere un val intunecat peste
poza, altfel nu se citeste. Asta intra in tensiune cu sectiunea 7 din `first-context.md`,
care cere fotografie mare si luminoasa de plante.

Regula practica: **textul sta sub poza ori de cate ori se poate**, nu peste ea. Valul
intunecat se foloseste doar cand compozitia chiar il cere, si atunci cat mai usor.

### Machetare de recuperat

Ecranul de gradina cu plante reale - card mare cu poza, etichete, inele de progres,
camp de cautare - a fost prototipat si sters dupa decizie. Se recupereaza din commit-ul
`76eb9d2`, fisierul `src/app/preview/dark/page.tsx`.

Poza folosita acolo e pastrata la `public/demo/monstera.jpg` - generata cu 3D AI Studio,
utila pentru machetari si stari demonstrative. Nu e folosita momentan de niciun ecran.

## 6. Reguli care raman neschimbate din first-context.md

Sectiunea 81 se aplica integral, cu aceste traduceri de stack:

* „Do not put Supabase queries inside presentation widgets" -> nu in componente React
* „Do not expose secrets in Flutter Web" -> nimic secret in cod client sau in
  variabile `NEXT_PUBLIC_*`
* „Reuse the existing design system" -> verifica `src/components/ui` inainte de a
  crea o componenta noua

Raman obligatorii si: RLS pe toate tabelele, migratii pentru orice schimbare de schema,
output AI structurat si validat, context AI construit intentionat, mobile-first la 390px,
stari de incarcare/goale/eroare pentru fiecare feature.

## 7. Jurnal de decizii

| Data | Decizie | Motiv |
|---|---|---|
| 2026-09-10 | Next.js in loc de Flutter Web | Bundle mult mai mic pe iOS, PWA si Web Push mai bune, deploy nativ pe Vercel |
| 2026-09-10 | Fara Supabase Edge Functions | Next.js are deja server; un singur target de deploy |
| 2026-09-10 | Un singur mediu Supabase | Proiect personal, un utilizator |
| 2026-09-10 | Allow-list pe email | Aplicatie privata; protejeaza si cota Gemini |
| 2026-09-11 | Vercel face build si deploy din GitHub; Actions ruleaza doar verificarile si migratiile | Vercel compileaza Next.js nativ; build in Actions ar pierde preview-urile pe PR |
| 2026-09-11 | Lista de acces in tabelul `public.allowed_emails`, nu in variabile de mediu | Verificarea in baza de date nu poate fi ocolita si se schimba fara redeploy |
| 2026-09-11 | `next_watering_at` se calculeaza, nu se stocheaza | O singura sursa de adevar: `last_watered_at` + interval |
| 2026-09-11 | Starea `thriving` amanata | V1 nu are semnalele care sa o justifice; nu inventam stari |
| 2026-09-12 | Tema intunecata, dupa o referinta vizuala | Decizia proprietarului, inlocuieste alegerea initiala de tema luminoasa |
| 2026-09-11 | Model implicit `gemini-3.5-flash` | Masurat: ~13s si constant. `3.8-flash` da 503 des; `flash-lite` e de 3x mai rapid dar e un model mai slab la recunoastere fina, iar identificarea speciei e chiar miezul functiei |

---

## 8. Next.js

Acest proiect foloseste Next.js 16, care are schimbari incompatibile fata de versiunile
anterioare. Citeste regulile generate automat inainte de a scrie cod de framework:

@AGENTS.md

### Capcane Next.js 16 (verificate in `node_modules/next/dist/docs`)

* **`middleware.ts` nu mai exista** — se numeste `proxy.ts`, functia exportata se numeste
  `proxy`, ruleaza pe runtime `nodejs` (nu edge, si nu e configurabil).
  Ghidurile Supabase de pe internet inca zic `middleware` — sunt depasite.
* **`cookies()`, `headers()`, `params`, `searchParams` sunt async.** Accesul sincron a fost
  eliminat complet. Intotdeauna `await`.
* **`revalidateTag` cere al doilea argument** (profil `cacheLife`), ex. `revalidateTag('x', 'max')`.
  Pentru „vezi imediat ce ai schimbat" foloseste `updateTag(tag)` din Server Actions.
* **`cacheLife` / `cacheTag`** sunt stabile, fara prefix `unstable_`.
* **Turbopack e implicit.**
* Tipuri pentru rute: `npx next typegen` genereaza `PageProps<'/ruta'>`, `LayoutProps`, `RouteContext`.
* Route Handlers nu sunt cache-uite implicit — exact ce vrem pentru rutele de AI.
