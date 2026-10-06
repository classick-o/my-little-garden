# Gradina 3D

**Stare:** pagina in aplicatie, la `/garden`. Plantele sunt inca de proba.
**Inceput:** 6 octombrie 2026
**Document de plan**, nu specificatie de produs. `first-context.md` ramane specificatia.

---

## 1. Ce este si ce nu este

O gradina vazuta in 3D dintr-un unghi fix, in care fiecare planta scanata apare ca model
3D intr-un stil unitar. Gradina creste in timp.

### Conditia care decide totul

`first-context.md` interzice la sectiunile 42 si 80 ca aplicatia sa para un joc. Ideea
trece testul doar daca gradina e **o oglinda, nu un joc**:

* **joc**: monede, timere, decoratiuni cumparate, gradina creste pentru ca te joci
* **oglinda**: gradina arata exact ce a facut ea in realitate

Nicio actiune din 3D nu are voie sa fie o actiune care nu s-a intamplat cu adevarat. Asa
feature-ul devine sectiunea 78 - arhiva vie - vazuta dintr-o privire.

Referinta vizuala a fost un joc de ferma, cu monede, cristale, timere, magazin si
misiuni. S-a luat lumea si interactiunile; s-a lasat economia.

---

## 2. Unde e acum

| | |
|---|---|
| Ruta | `/garden`, in afara invelisului aplicatiei |
| Fara bara de navigatie | scena ocupa tot ecranul, iar cardul plantei urca tocmai de unde ar fi stat bara |
| Iesire | sageata din coltul de sus dreapta |
| Intrare | buton secundar pe ecranul principal |
| Plante | **de proba**, din `src/components/garden3d/sample-garden.ts` |

Ce functioneaza: insula patrata cu noua parcele, mutarea plantelor intre parcele cu
schimb, atingerea care aduce planta in prim-plan, cardul cu starea de udare, apropierea
si deplasarea in limitele gradinii, valea pictata din fundal.

### Ce lipseste ca sa se lege de date reale

In ordinea in care trebuie facute:

1. **Autentificare** - Google OAuth prin Supabase. Fara ea nu exista utilizator, deci nu
   exista plantele lui.
2. **Depozitul de plante** - singurul loc care vorbeste cu Supabase (CLAUDE.md sectiunea
   3). Citeste `plants` si `plant_events`.
3. **Traducerea** rand din baza -> `GardenPlant`. Tipul e deja separat, in
   `garden-plant.ts`, exact ca sa existe un singur loc unde se face traducerea asta.
4. **Maparea specie -> model**, descrisa mai jos. Fara ea, pasul 3 nu are ce pune in `url`.

Pana atunci, pagina arata gradina de proba. Speciile alese acolo acopera intentionat
toate arhetipurile modelate si toate starile de udare - inclusiv o planta cu udarea mult
intarziata - ca scena sa fie vazuta cum arata in realitate, nu cum arata cand totul e in
regula.

---

## 3. De la poza ei la planta in 3D

Intrebarea: cand scaneaza o planta, cum construim modelul 3D, si cum facem sa semene cu
planta ei?

### 3.1 De ce nu generam la cerere

Varianta evidenta ar fi: poza -> identificare cu Gemini -> apel catre 3D AI Studio ->
model descarcat -> pus in Storage -> randat. Nu o facem, din cinci motive, in ordinea
greutatii lor.

**1. Nimeni nu vede rezultatul inainte sa ajunga in gradina ei.** Asta e motivul decisiv.
Conversia imagine -> 3D iese inegal: uneori scara e gresita, obiectul e culcat, ghiveciul
nu arata a ghiveci, frunzele sunt topite. In prototip fiecare model a fost verificat si
corectat de mana. La rulare nu exista nimeni care sa spuna "asta a iesit prost", iar
modelul prost ramane in gradina ei.

**2. Stilul unitar e fragil, si el e tot rostul scenei.** Prototipul a aratat ca unitatea
vine dintr-un bloc de stil **identic cuvant cu cuvant** la etapa de imagine. Blocul ala e
munca scrisa de mana. La rulare functioneaza in medie, dar un rezultat din zece care iese
in alt stil strica tot setul, pentru ca gradina le arata una langa alta. O biblioteca
curatata are zero abateri, prin constructie.

**3. Costul e pe actiune si nu are plafon.** Masurat: ~25 de credite pe planta (5 pentru
imagine, 20 pentru model). O planta adaugata, stearsa si readaugata plateste de doua ori.
O generare esuata si reincercata, la fel. Creditele sunt finite si nu exista nivel gratuit
in care sa cadem.

**4. Asteptarea rupe fluxul de adaugare.** Generarea dureaza 1-5 minute. Fluxul e acum
poza -> identificare (~13s) -> nume -> gata. Cu inca 1-5 minute devine corvoada. In plus,
pe iOS o aplicatie trimisa in fundal e suspendata, deci clientul nu poate astepta: ar
trebui tabel de sarcini, interogare periodica sau notificare. Un subsistem intreg.

**5. Inca o dependenta externa in calea critica.** Supabase si Gemini sunt deja acolo. Un
al treilea serviciu, cu cheia, cota, coada si felurile lui de a cadea, inseamna ca
"adauga o planta" poate esua dintr-un motiv care nu are nicio legatura cu plantele.

**Concluzia:** generarea e un act de autor, nu un act de rulare. Se face pe partea mea,
offline, cu verificare, iar rezultatul se comite in repo. Exact CLAUDE.md sectiunea 4b.

Nu e interzisa pentru totdeauna - vezi 3.5.

### 3.2 Ce face de fapt asemanarea

Asemanarea nu vine dintr-un singur loc. Vine din trei straturi, in ordinea cat cantaresc:

| Strat | Cat conteaza | De unde vine |
|---|---|---|
| Specia | mult | identificarea AI, care exista deja |
| Forma, cand specia nu e in biblioteca | mediu | clasificare AI intr-o lista fixa |
| Variatia pe exemplarul ei | surprinzator de mult | poza si istoricul ei |

Un `Monstera deliciosa` arata a monstera. Asta e, de departe, cea mai mare parte din
"seamana cu a mea". Restul il face stratul al treilea, si e ieftin.

### 3.3 Biblioteca de specii

Un tabel, nu o ghicitoare:

```
plant_models
  species            numele stiintific, normalizat
  genus              genul, pentru potrivirea de rezerva
  archetype          una din formele noastre fixe
  model_path         /garden3d/<nume>.glb
  wind               cat de tare o misca vantul
  default_height     inaltimea obisnuita, in unitatile scenei
```

Cautarea, in ordine, prima care gaseste castiga:

1. **nume stiintific exact** - `Monstera deliciosa`
2. **gen** - `Monstera adansonii` -> genul `Monstera` -> modelul de monstera
3. **arhetipul** dat de AI - `Calathea orbifolia` -> `frunze-mari`
4. **arhetipul implicit**, ca sa nu existe niciodata planta fara model

Normalizarea numelui conteaza mai mult decat pare: minuscule, spatii curatate, fara
soiul dintre ghilimele (`Monstera deliciosa 'Thai Constellation'`), fara `var.` si
`subsp.`. Altfel potrivirea exacta rateaza tocmai la plantele de apartament, care sunt
aproape toate soiuri.

### 3.4 Arhetipurile

Cand specia nu e acoperita, nu aratam o planta gresita - aratam forma potrivita. Lista e
fixa si a noastra:

`frunze-mari`, `cataratoare`, `suculente`, `cactusi`, `ferigi`, `palmieri`, `flori`,
`ierburi`

**AI-ul alege din lista, nu inventeaza raspunsul.** Asta cere un camp nou in schema de
identificare, cu valori inchise si validare - acelasi tipar ca la incadrarea pe categorii
din ideea cu magazinele, si ce cere sectiunea 70. Un text liber ar da `plant with big
leaves` si ar trebui ghicit inapoi.

**Nu e implementat inca.** E o schimbare a contractului AI, deci isi merita propria
sarcina.

### 3.5 Variatia pe exemplar

Doua monstere nu au voie sa fie gemene. Toate variatiile de mai jos sunt deterministe -
aceeasi planta arata la fel de fiecare data cand deschide gradina:

* **Marimea** - din inregistrarea plantei. Modelul se scaleaza.
* **Culoarea ghiveciului** - citita din treimea de jos a pozei ei. E cel mai ieftin si cel
  mai eficient truc din lista: ghiveciul de teracota fata de cel alb de ceramica e primul
  lucru pe care il observi. Nu are nevoie de AI, doar de culoarea dominanta. **Cere ceva
  de la biblioteca:** in fiecare model, ghiveciul trebuie sa fie mesh separat, cu nume
  constant - altfel nu are ce fi colorat.
* **Rotatia si parcela** - stabile, pornite din identificatorul plantei.
* **Cat e de plina** - din `plant_events`, care inregistreaza deja fiecare udare si poza.
  Modelul creste putin in timp.
* **Nuanta de sanatate** - starea de ingrijire schimba usor culoarea frunzelor, niciodata
  modelul. Foarte usor: o planta vizibil trista ar fi tocmai jocul pe care sectiunile 42
  si 80 il interzic.
* **Intensitatea vantului**, pe specie. Detaliul care vinde scena: o sansevieria e
  rigida, un pothos cade moale. Daca toate se misca la fel, scena pare facuta dintr-un
  singur material.

### 3.6 Portretul: unde ramane magia

Generarea dupa poza ei ramane, dar ca moment rar si cerut explicit:

* la o aniversare a plantei, sau cand cere ea - "fa-i un portret"
* **in coada, nu blocant**: cere acum, primeste mai tarziu, cu notificare
* **cu plafon de buget** verificat pe server inainte de a cheltui

Asa cad obiectiile 3 si 4 din 3.1: rar si asincron inseamna ca asteptarea si costul nu mai
sunt in calea critica. Obiectia 1 - ca nimeni nu verifica - ramane, iar raspunsul cinstit
e sa i-o aratam ei si sa aleaga: tine portretul sau se intoarce la modelul din biblioteca.
Problema verificarii devine astfel chiar o functie.

### 3.7 Ce cere in schema

* `plant_models` - tabel nou, populat de noi, doar citire pentru client
* `plants.model_override` - nullable, pentru portret
* nimic altceva: progresia citeste `plant_events`, care exista deja

### 3.8 Ce se masoara inainte de a merge mai departe

**Cat de des identificarea intoarce o specie din afara bibliotecii.** Daca e rar,
biblioteca castiga fara discutie si portretul ramane doar un lux. Daca e des, inseamna ca
biblioteca trebuie crescuta, si stim exact cu ce - din lista speciilor ratate.

---

## 4. Cum se face un model nou

Stilul unitar se rezolva la etapa de imagine, nu la cea de 3D. Generarea directa
text-to-3D da de fiecare data alt stil.

1. se genereaza intai o imagine de referinta, cu un bloc de stil **identic cuvant cu
   cuvant**, schimband doar descrierea plantei (5 credite)
2. imaginea se converteste in 3D (Meshy low-poly, 20 credite)
3. se optimizeaza:

```
npx @gltf-transform/cli optimize in.glb out.glb \
  --texture-size 512 --texture-compress webp --compress false
```

Dimensiunea e problema reala si se rezolva aici: modelele ies la ~2 MB fiecare, aproape
numai textura - mesh-ul are doar ~4.500 de varfuri. Dupa optimizare: **8,1 MB -> 796 KB**,
adica ~200 KB pe planta.

Three.js adauga ~150-200 KB la pachet, si se incarca doar la intrarea in ecran.

**Animatia nu are nevoie de schelet.** Modelele generate nu au os, deci frunzele nu pot fi
animate individual. Se rezolva in vertex shader: varfurile se deplaseaza cu atat mai mult
cu cat sunt mai sus fata de baza obiectului. Ghiveciul sta, frunzele se leagana. Merge pe
orice model, fiindca inaltimea se citeste din bounding box la rulare.

---

## 5. Capcane intalnite, toate tacute

Niciuna nu a dat eroare; toate doar aratau prost.

* **Lipirea geometriilor fara index** amesteca triunghiurile. Iarba a iesit ca niste fire
  lungi aruncate peste insula, iar muntii ca niste cioburi in cer. Se foloseste
  `mergeGeometries` din `BufferGeometryUtils`.
* **`useTexture` cu o lista** nu garanteaza ordinea in care intorc texturile. Pamantul a
  ajuns pe iarba fara nicio eroare. Se incarca fiecare textura cu apelul ei.
* **Cilindri suprapusi**: un strat fara deplasare pe verticala strapungea discul de iarba.
  Cotele fiecarui strat se scriu explicit.
* **Sub insula nu ajunge lumina.** In loc de inca o sursa doar pentru stanca, materialul
  primeste emisie proprie.
* **Postprocesarea da ecran negru pe telefon.** `EffectComposer` a fost scos complet.
  Vinieta arata la fel ca strat CSS, cu zero cost.
* **Limite de zoom fixe dau tot ecran negru.** Distanta de incadrare se calculeaza din
  latimea ecranului; o limita fixa poate ramane sub ea pe un ecran ingust, si camera
  ajunge in afara intervalului permis. Limitele se calculeaza acum din distanta reala.
* **Pragul atingere/tragere masurat in unitati din lume** facea ca orice atingere pe
  telefon sa treaca drept tragere: degetul pus pe frunze trimite raza dincolo de ghiveci.
  Se masoara in pixeli de ecran, fata de locul unde a coborat degetul.
* **Panza de fundal vopsita in culoarea cetii** acopera cerul cu o pata plata. Se face
  transparenta, nu colorata.
* **Gradientul cupolei legat de raza** se stinge cand cupola e marita. Se calculeaza din
  directie.

---

## 6. Cum se testeaza

Camera fiind fixa si determinista, pozitia pe ecran a oricarui punct din lume se poate
calcula in afara browserului, cu aceeasi matematica de incadrare din `camera.ts`. Mult mai
sigur decat ghicitul coordonatelor.

Doua lucruri de care sa se tina cont la capturi:

* scena e animata permanent. Doua capturi la distanta difera oricum, deci orice comparatie
  de imagini are nevoie intai de o masuratoare a zgomotului de fond.
* norii mari se misca mult. Zgomotul masurat pe 1,3 secunde nu e valabil pentru o
  comparatie intre capturi aflate la 5 secunde una de alta.
