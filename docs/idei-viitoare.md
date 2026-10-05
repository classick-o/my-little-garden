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


---

## Gradina 3D

**Propus:** 6 octombrie 2026
**Cand:** dupa V1, cand exista cateva luni de date reale
**Stare:** prototip facut si verificat

### Ideea

O gradina vazuta in 3D dintr-un unghi fix, in care fiecare planta scanata apare ca
model 3D intr-un stil unitar. Gradina creste in timp.

### Conditia care decide totul

`first-context.md` interzice la sectiunile 42 si 80 ca aplicatia sa para un joc. Ideea
trece testul doar daca gradina e **o oglinda, nu un joc**:

* **joc**: monede, timere, decoratiuni cumparate, gradina creste pentru ca te joci
* **oglinda**: gradina arata exact ce a facut ea in realitate

Nicio actiune din 3D nu are voie sa fie o actiune care nu s-a intamplat cu adevarat.
Asa feature-ul devine sectiunea 78 - arhiva vie - vazuta dintr-o privire.

### Ce am verificat prin prototip

**Consistenta stilului se rezolva la etapa de imagine, nu la cea de 3D.** Generarea
directa text-to-3D da de fiecare data alt stil. Solutia care functioneaza:

1. se genereaza intai o imagine de referinta, cu un bloc de stil **identic cuvant cu
   cuvant**, schimband doar descrierea plantei (5 credite)
2. imaginea se converteste in 3D (Meshy low-poly, 20 credite)

Patru plante facute asa au iesit vizibil din acelasi set: aceeasi paleta, acelasi
material mat, acelasi ghiveci.

**Dimensiunea fisierelor e problema reala, si se rezolva.** Modelele ies la ~2 MB
fiecare, aproape numai textura - mesh-ul are doar ~4.500 varfuri. Dupa micsorarea
texturilor la 512px si trecerea pe webp:

```
8,1 MB  ->  796 KB   (~200 KB pe planta)
```

Comanda: `npx @gltf-transform/cli optimize in.glb out.glb --texture-size 512
--texture-compress webp --compress false`

**Animatia nu are nevoie de schelet.** Modelele generate nu au os, deci frunzele nu pot
fi animate individual. Se rezolva in vertex shader: varfurile se deplaseaza cu atat mai
mult cu cat sunt mai sus fata de baza obiectului. Ghiveciul sta, frunzele se leagana.
Merge pe orice model, fiindca inaltimea se citeste din bounding box la rulare.

Detaliul care vinde scena: **fiecare specie primeste alta intensitate de vant**. O
sansevieria e rigida, un pothos cade moale. Daca toate se misca la fel, scena pare
facuta dintr-un singur material.

### Costuri reale

* ~25 de credite per planta (imagine + model low-poly)
* ~200 KB per model, dupa optimizare
* Three.js adauga ~150-200 KB la pachet - se incarca doar la intrarea in ecran

### Recomandarea

Un set curatat de 10-12 modele pe categorii (frunze mari, cataratoare, suculente,
cactusi, ferigi, palmieri, flori, ierburi), generate o singura data si comise in repo.
Identificarea AI da specia, maparea spre categorie e banala.

Generarea unica, dupa poza ei, ramane ca moment special - la o aniversare a plantei,
nu la fiecare adaugare. Asa avem si coerenta, si magia.

### Ce nu are nevoie de tabele noi

Progresia citeste `plant_events`, care inregistreaza deja fiecare udare, poza si mutare.
Modelul de evenimente ales la schema initiala acopera tot ce ii trebuie scenei 3D.

### Prototipul

Live la `/preview/garden3d`, impreuna cu:

* `src/components/garden3d/` - scena, planta, shaderul de vant
* `public/garden3d/*.glb` - cele patru modele, deja optimizate

E cod de test, nu de productie: datele sunt scrise de mana, iar panoul cu reglaje de vant
si crestere exista doar ca sa se vada efectul. Se sterge dupa ce decidem - exact ca
previzualizarile de tema.
