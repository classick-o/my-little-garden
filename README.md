# My little garden

O gradina digitala personala: plantele tale, istoria lor, si un asistent care le cunoaste.

Aplicatie PWA, mobile-first, in limba romana.

## Documentatie

| Fisier | Ce contine |
|---|---|
| [first-context.md](first-context.md) | Specificatia produsului. Sursa de adevar. |
| [CLAUDE.md](CLAUDE.md) | Reguli de lucru, stack, jurnalul deciziilor. |
| [docs/setup.md](docs/setup.md) | Configurarea conturilor: Supabase, Google, Gemini, Vercel. |
| [docs/idei-viitoare.md](docs/idei-viitoare.md) | Idei acceptate ca directie, dar amanate. |

## Pornire locala

```bash
npm install
cp .env.example .env.local   # apoi completeaza dupa docs/setup.md
npm run dev
```

`http://localhost:3000`

### Pe telefon

Aplicatia e mobile-first, deci merita testata pe telefonul real. `npm run dev` asculta deja
pe toata reteaua, nu doar pe localhost.

De pe telefonul conectat la acelasi Wi-Fi, deschide `http://<ip-ul-calculatorului>:3000`.

**Atentie:** adresa afisata de Next la "Network" poate fi gresita. Daca ai VMware sau
VirtualBox instalat, Next alege adaptorul lor virtual (`192.168.47.x`), care nu e vizibil
de pe telefon. Iti trebuie adresa adaptorului **Wi-Fi**:

```bash
ipconfig
```

Daca tot nu se incarca, firewall-ul Windows blocheaza portul: la prima rulare cere
permisiune pentru Node.js si trebuie acceptata pentru reteaua privata.

## Comenzi

| Comanda | Ce face |
|---|---|
| `npm run dev` | Server de dezvoltare (accesibil si din reteaua locala) |
| `npm run build` | Build de productie |
| `npm run lint` | ESLint |
| `npm run typecheck` | Verificare de tipuri |
| `npm run icons` | Regenereaza iconitele PWA din `scripts/generate-icons.mjs` |
| `npm run shot` | Capturi de ecran la 390x844 (serverul de dev trebuie sa ruleze) |
| `npm test` | Teste |
| `npm run models` | Ce modele Gemini accepta cheia ta |
| `npm run smoke:ai` | Verificare cu o cerere reala catre Gemini (consuma cota) |
| `npm run secrets` | Genereaza cheile VAPID si secretul de cron in `.env.local` |
| `npm run check:env` | Verifica faptul ca `.env.example` nu contine valori reale |

Exemplu: `npm run shot -- discover journal`

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Supabase · Gemini · Vercel
