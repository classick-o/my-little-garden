# Obiective

Document de lucru pentru proprietarul proiectului. Spune **ce urmarim si cum stim ca am
reusit** - nu cum se construieste. `first-context.md` ramane specificatia produsului,
`CLAUDE.md` tine deciziile.

Scris: 12 octombrie 2026.

---

## 1. Obiectivul unic

> **Ea sa aiba grija mai bine de plantele ei decat fara aplicatie, si sa-i faca placere
> sa o deschida.**

Tot restul din documentul asta serveste propozitia de mai sus. Cand o decizie e grea, se
intreaba: ajuta asta o persoana reala sa-si ingrijeasca plantele, sau doar arata bine
intr-o captura?

Aplicatia are **un singur utilizator**. Asta schimba ce inseamna reusita: nu exista
crestere, nu exista conversie, nu exista cohorte. Exista o persoana care o foloseste sau
nu o foloseste.

---

## 2. Cum arata reusita

Semnale, nu metrici. Niciunul nu are nevoie de analitica - toate se vad cu ochiul liber.

| # | Semnal | De ce tocmai asta |
|---|---|---|
| 1 | **Isi adauga prima planta singura**, fara sa-i explice nimeni | Daca are nevoie de instructiuni, fluxul e gresit, nu ea |
| 2 | **O deschide fara sa fie rugata**, in majoritatea zilelor dintr-o saptamana obisnuita | Masoara obiceiul, nu noutatea. Se verifica dupa a doua saptamana, nu in prima |
| 3 | **Cel putin o planta e udata pentru ca aplicatia i-a amintit** | Singura dovada directa ca aplicatia a schimbat ceva in realitate |
| 4 | **Spune cuiva despre ea, nesolicitata** | Cel mai greu de obtinut si cel mai greu de pacalit |
| 5 | **Nu intreaba niciodata "ce inseamna asta?"** | Limba si claritatea isi fac treaba |

### Semnalul de alarma

Daca o deschide des in prima saptamana si aproape deloc in a treia, nu e un obicei - e
curiozitate. Atunci problema nu se rezolva cu functii noi, ci cu bucla zilnica: ce vede
cand o deschide si de ce s-ar intoarce maine.

---

## 3. Ce inseamna "V1 gata"

Lantul din `first-context.md` sectiunea 72, fiecare veriga raspunsa cu da sau nu:

- [ ] Se autentifica cu Google si numai ea intra (lista de acces)
- [ ] Vede gradina ei: plantele, si care au nevoie de atentie azi
- [ ] Adauga o planta, manual si cu poza
- [ ] Deschide o planta si ii vede povestea
- [ ] Marcheaza udarea, si aplicatia stie cand urmeaza urmatoarea
- [ ] Adauga poze la o planta
- [ ] Scrie si citeste insemnari in jurnal
- [ ] Fotografiaza o planta si AI-ul ii spune ce specie e

Sectiunea 72 cere explicit **"polished rather than huge"**. V1 se considera gata cand
cele opt sunt bifate si lustruite, nu cand mai adaugam ceva.

---

## 4. Obiective de calitate

Verificabile. Daca nu se pot verifica, nu sunt obiective, sunt dorinte.

| Obiectiv | Cum se verifica |
|---|---|
| Tot textul vizibil in romana fara diacritice - inclusiv erorile si raspunsurile AI | Citire pe ecrane; promptul cere explicit romana |
| Niciun secret in browser | `npm run check:env` in CI; nimic sensibil in `NEXT_PUBLIC_*` |
| RLS pe fiecare tabel: un alt cont nu vede niciun rand | Test cu al doilea cont |
| Merge la 390px, fara derulare orizontala | Capturi la 390px pe fiecare ecran |
| Identificarea raspunde sub ~20s, sau spune cinstit ca mai dureaza | Masurat: ~13s cu `gemini-3.5-flash` |
| Niciun raspuns AI nevalidat nu ajunge pe ecran | Schema zod, aceeasi la cerere si la validare |
| AI-ul nu inventeaza: cand nu stie, spune ca nu stie | Sectiunea 34; incredere afisata |
| Cel mult o notificare pe zi, si niciuna pentru ceva neadevarat | Cron o data pe zi (limita Vercel Hobby) |
| Fiecare ecran are stare de incarcare, stare goala si stare de eroare | Trecere prin toate trei, pe fiecare ecran |
| Orice schimbare de schema are migratie | Nimic aplicat de mana in Supabase |
| Gradina 3D ramane oglinda, nu joc | Nicio actiune din 3D care nu s-a intamplat in realitate |

---

## 5. Ce nu facem in V1

Nu pentru ca ar fi idei proaste, ci pentru ca sectiunea 72 spune "lustruit, nu mare".
Toate au deja locul lor: V1.5 si V2 in `first-context.md`, restul in
[idei-viitoare.md](idei-viitoare.md).

* chat AI si analiza AI a plantei - V1.5
* realizari, descoperiri, colectie - V1.5
* XP si nivel de gradina - sectiunea 42, si oricum se bate cap in cap cu "nu e joc"
* cautarea in magazine - dupa V1
* legarea gradinii 3D de date reale - dupa V1 (vezi [plan-gradina-3d.md](plan-gradina-3d.md))
* analitica - sectiunea 71 o amana explicit

---

## 6. Unde suntem acum

Actualizat: 12 octombrie 2026, dupa implementarea lantului V1.

### Ce e scris si compileaza

| Strat | Ce contine |
|---|---|
| Acces la date | clientii Supabase (browser, server, administrare), `src/proxy.ts` care reimprospateaza sesiunea si pazeste rutele |
| Depozite | plante, evenimente, poze - singurele locuri care vorbesc cu Supabase |
| Autentificare | pagina de conectare, intoarcerea de la Google, intrarea pe baza de jeton, iesirea din cont |
| Actiuni | adaugare, udare, insemnare, incarcare de poza, coperta, stergere - toate cu validare |
| Ecrane | Gradina, Adauga planta, Detaliul plantei, Jurnal |
| AI | ruta `/api/identify`, chemata din formularul de adaugare |

### Ce e verificat capat la capat

Pe stack-ul Supabase local, cu baza adevarata, intr-o singura trecere:

| # | Pas | Rezultat |
|---|---|---|
| 1 | Intrare cu jeton | ajunge pe Gradina |
| 2 | Gradina goala | starea goala afisata |
| 3 | Adaugare planta, cu poza | duce la pagina plantei |
| 4 | Detaliul | nume, "Se simte bine", "Udata astazi" |
| 5 | Pozele | 3 imagini incarcate cu adevarat |
| 6 | Insemnare | aparuta in istoric |
| 7 | Jurnal | insemnare, doua poze, intrarea in gradina |
| 8 | Gradina | planta pe card, cu coperta |
| 9 | Sesiunea | rezista la reincarcare |
| 10 | Iesire | duce la conectare |

Fara nicio eroare in browser si fara niciun raspuns 500.

Pe langa asta: build-ul trece, tipurile si stilul trec, 48 de teste trec, iar
paza rutelor trimite la conectare si tine minte unde voiai sa ajungi.

**Nu e verificat**: identificarea AI dintr-o poza reala si conectarea cu Google
- vezi blocajul 2.

### Defecte gasite si reparate pe drum

* **`proxy.ts` in radacina proiectului nu ruleaza.** Trebuie sa stea langa
  `app`, adica in `src/`. Pana la mutare, fiecare ruta se deschidea fara
  autentificare - fara niciun semn ca ceva nu e in regula. Build-ul listeaza
  acum explicit `ƒ Proxy (Middleware)`, si asta e dovada ca exista.
* **Un fisier `"use server"` poate exporta numai functii asincrone.** O
  constanta exportata de acolo opreste cererea, iar mesajul nu spune care e de
  vina. Starea actiunilor sta acum in `action-state.ts`.
* **Poza aleasa la adaugare se pierdea.** Era folosita doar pentru identificare.
  Acum pleaca odata cu formularul si devine prima poza si coperta.
* **Next refuza imaginile de pe IP-uri private**, ca protectie impotriva SSRF -
  deci nicio poza nu se vedea pe stack-ul local. Exceptia e pornita numai cand
  gazda chiar e locala.
* **Campul de fisier isi scrie singur textul, in engleza** - "Choose File / No
  file chosen". Nu se poate traduce, deci e ascuns si inlocuit cu `FilePicker`.

---

## 7. Blocaje

Scrise ca sa nu se piarda. Niciunul nu se poate rezolva din cod.

### 1. Proiectul Supabase nu raspunde

Subdomeniul proiectului nu se mai rezolva in DNS, desi internetul si
`supabase.com` merg. Cel mai probabil proiectul e oprit - proiectele gratuite se
opresc dupa o perioada de inactivitate, iar ultima atingere a fost pe
11 septembrie.

**Blocheaza:** verificarea tuturor fluxurilor cu date. Codul e scris, dar nimeni
nu a vazut inca o planta salvata.

**Doua remedii:**

* **Repornirea proiectului** din panoul Supabase (buton *Restore*). Pastreaza
  decizia "un singur mediu" si datele existente.
* **Supabase local, cu Docker.** Docker e instalat, dar nu pornit. Ar da
  independenta totala fata de cloud pentru dezvoltare, cu pretul unui al doilea
  mediu - adica exact impotriva deciziei din 10 septembrie.

### 2. Clientul Google OAuth nu exista

Conectarea adevarata nu are cum sa functioneze fara el.

**Ocolire pentru local:** `npm run dev:login -- adresa@exemplu.com` genereaza un
jeton de unica folosinta prin Supabase si tipareste o legatura de intrare. Nu e
o usa din dos: jetonul e emis de Supabase, expira, iar adresa trebuie sa fie pe
lista de acces. Ruta care il preschimba, `/auth/confirm`, e tiparul standard
pentru legaturi magice si va fi oricum necesara.

### 3. Vercel nu e legat de GitHub

Fara el nu exista link permanent, iar testarea pe telefon depinde de
calculatorul meu pornit.

### 4. Notificarile nu se pot proba local

Web Push pe iOS cere HTTPS si aplicatia instalata pe ecranul principal. Nu se
poate verifica decat dupa ce exista o adresa publica.

---

## 8. Ce ramane de decis

Lucruri care schimba planul si pe care nu le pot hotari eu:

1. **Cum deblocam baza de date** - repornire in cloud sau stack local cu Docker. Vezi
   blocajul 1. Pana atunci, nimic cu date nu se poate proba.
2. **Exista un termen?** O aniversare, o ocazie. Schimba ce se lustruieste intai.
3. **Stie ea de aplicatie?** Daca e surpriza, pasul 1 are nevoie si de contul ei de
   Google, si un moment ales pentru prima deschidere.
4. **Are plante care asteapta?** Cate sunt decide daca adaugarea in masa merita facuta, si
   daca gradina 3D are suficiente plante ca sa arate a gradina.
