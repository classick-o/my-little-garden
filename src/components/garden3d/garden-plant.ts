/**
 * O planta asa cum o vede scena 3D.
 *
 * Deliberat separata de randul din baza de date: scena are nevoie de lucruri
 * pe care baza nu le stie (ce model, cat de tare o misca vantul, in ce parcela
 * sta), iar baza tine lucruri care scenei nu-i spun nimic. Traducerea dintre
 * ele se face intr-un singur loc, cand exista.
 */
export type GardenPlant = {
  id: string;
  name: string;
  species: string;
  /** Modelul 3D. Vine din biblioteca de specii - vezi docs/plan-gradina-3d.md. */
  url: string;
  /** Parcela in care sta. Pozitia reala vine din PLOTS. */
  plot: number;
  height: number;
  rotation: number;
  /* Cat de mult o misca vantul. O sansevieria e rigida, un pothos cade moale -
     daca toate s-ar misca la fel, scena ar parea facuta din acelasi material. */
  wind: number;
  wateredDaysAgo: number;
  wateringIntervalDays: number;
  daysOwned: number;
};
