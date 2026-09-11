# Idei pentru mai tarziu

Lucruri discutate si acceptate ca directie, dar **care nu se construiesc acum**.
Sunt notate aici ca sa nu se piarda si ca sa nu ajunga din greseala in V1.

`first-context.md` ramane specificatia produsului. Fisierul asta e doar o lista de
asteptare.

---

## Unde cumpar de aici? (cautare in magazinele din Bucuresti)

**Propus:** 11 septembrie 2026
**Cand:** dupa V1

### Ideea

Ea scrie `pamant de flori` si vede de unde poate cumpara, sortat dupa cat de aproape
e magazinul.

### Ce e realizabil si ce nu

| Strat | Realizabil |
|---|---|
| Magazine din apropiere care vand de obicei categoria cautata | Da |
| Produsul si pretul, online, cu livrare | Da, prin legaturi catre magazine |
| Stoc real, pe raft, acum | **Nu** |

Nu exista niciun API cu inventarul magazinelor locale din Romania. Scraping-ul ar fi
fragil, problematic din punct de vedere legal si tot nu ar fi de incredere. Al treilea
strat e in afara discutiei.

### Cum ar functiona

1. **Textul cautat devine categorie.** "pamant de flori", "substrat", "turba" inseamna
   toate *pamant*. Un dictionar local scris de mana acopera aproape tot, instant si
   gratuit. Pentru ce nu recunoaste, Gemini incadreaza textul intr-una din categoriile
   noastre fixe - nu inventeaza raspunsul (`first-context.md` sectiunea 70).

2. **Magazinele din apropiere.** Doua surse posibile:
   * **OpenStreetMap / Overpass API** - gratuit, fara cheie si fara card. Are etichetele
     `shop=garden_centre`, `shop=florist`, `shop=doityourself`. Acoperirea Bucurestiului
     e decenta, programul de functionare lipseste des.
   * **Google Places** - date mult mai bune, dar Google Maps Platform cere card pe cont
     chiar si pentru nivelul gratuit.

   Se incepe cu OpenStreetMap. Google doar daca acoperirea dezamageste.

3. **Sortare dupa distanta**, fata de pozitia GPS sau fata de o adresa "acasa" salvata in
   profil. A doua varianta e adesea mai utila: isi planifica de acasa.

4. **O a doua sectiune, online cu livrare**: legaturi directe catre cautarea produsului pe
   site-urile mari de bricolaj si gradinarit. Fara scraping, fara intretinere - vede
   produse reale, cu preturi si stocuri reale, pe site-ul magazinului.

### Reguli obligatorii

* Textul spune **"magazine care vand de obicei asta"**, niciodata "are in stoc".
  Sectiunea 34: nu prezentam nesigurul drept sigur. Diferenta dintre o aplicatie in care
  are incredere si una care o trimite degeaba prin oras.
* Adresele nu se genereaza cu AI. Vin dintr-o sursa de date reala.

### Unde ar sta in aplicatie

Mai degraba contextual, in pagina plantei - "Luna are nevoie de pamant nou? uite de unde
iei" - decat ca sectiune separata. Se potriveste cu ideea de insotitor, nu de catalog.
