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

Onest, pe 12 octombrie 2026.

### Ce e construit si verificat

* **Baza de date** - schema aplicata, RLS pe tot, bucket privat, declansator pe lista de
  acces. Verificata cu `npm run verify:db`.
* **Stratul AI** - identificare cu Gemini, iesire structurata si validata, clasificare a
  erorilor, reincercare la indisponibilitate. Verificat cu un test live real.
* **Sistemul de design** - tokeni, si componentele buton, card de jos, inel de progres,
  pastila de stare, cifra cu eticheta.
* **Gradina 3D** - pagina intreaga la `/garden`, cu plante de proba.
* **Livrare** - verificari automate pe `main`, migratii aplicate automat.

### Ce nu e construit

**Din cele opt verigi ale V1, niciuna nu functioneaza.**

Concret: in `src/` nu exista niciun apel catre Supabase. Nu exista autentificare. Cele
patru ecrane din navigatie - Descopera, Jurnal, Asistent, Adauga planta - sunt cioturi de
8-11 linii. Identificarea AI exista ca serviciu, dar niciun ecran nu o cheama.

### Observatia care conteaza

Am construit in profunzime partile placute - vizualul, gradina 3D, atmosfera - si n-am
atins deloc lantul V1. Asta nu e munca pierduta: schema, stratul AI si sistemul de design
sunt exact fundatia de care are nevoie lantul. Dar **ea inca nu poate sa intre in
aplicatie si sa adauge o planta**, iar asta e singurul lucru care conteaza acum.

Sectiunea 7 pune ordinea la loc.

---

## 7. Ordinea de lucru

Fiecare pas se termina cu ceva ce ea poate face. Nimic nu se incepe inainte ca pasul
anterior sa fie folosibil.

| # | Pas | Ea poate... | Blocat de |
|---|---|---|---|
| 1 | Autentificare | sa intre in aplicatie | client Google OAuth, de creat de tine |
| 2 | Depozit de plante + adaugare manuala | sa adauge o planta si sa o vada | - |
| 3 | Detaliile plantei + udare | sa marcheze udarea si sa vada cand urmeaza | - |
| 4 | Poze | sa adauge poze unei plante | - |
| 5 | Identificare AI in ecranul de adaugare | sa afle ce specie e | - |
| 6 | Jurnal | sa scrie si sa citeasca insemnari | - |
| 7 | Notificari | sa primeasca sumarul de dimineata | instalare pe ecranul principal |

Dupa pasul 7, V1 e gata. Abia apoi: legarea gradinii 3D la plantele adevarate.

### Doua lucruri blocate pe tine

1. **Clientul Google OAuth** - fara el nu incepe pasul 1, deci nimic.
2. **Legatura Vercel-GitHub** - fara ea nu exista link permanent, iar testarea pe telefon
   depinde de calculatorul meu pornit.

---

## 8. Ce ramane de decis

Lucruri care schimba planul si pe care nu le pot hotari eu:

1. **Exista un termen?** O aniversare, o ocazie. Schimba totul: cu termen, V1 se taie la
   pasii 1-3 si restul vine dupa. Fara termen, mergem pe lantul complet.
2. **Stie ea de aplicatie?** Daca e surpriza, pasul 1 are nevoie si de contul ei de
   Google, si de un moment ales pentru prima deschidere.
3. **Are plante care asteapta?** Cate sunt decide daca adaugarea in masa merita facuta, si
   daca gradina 3D are suficiente plante ca sa arate a gradina.
