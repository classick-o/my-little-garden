import type { GardenPlant } from "./garden-plant";

/**
 * Gradina de proba.
 *
 * Tine locul plantelor adevarate pana cand ecranul citeste din baza de date.
 * Nu e decor: alegerea speciilor acopera toate cele patru arhetipuri pe care
 * le avem modelate si toate starile de udare, ca scena sa fie vazuta cum
 * arata in realitate, nu cum arata cand totul e in regula.
 */
export const SAMPLE_GARDEN: GardenPlant[] = [
  {
    id: "luna",
    name: "Luna",
    species: "Monstera deliciosa",
    url: "/garden3d/monstera.glb",
    plot: 0,
    height: 1.3,
    rotation: 0.3,
    wind: 1,
    wateredDaysAgo: 3,
    wateringIntervalDays: 7,
    daysOwned: 184,
  },
  {
    id: "stela",
    name: "Stela",
    species: "Sansevieria trifasciata",
    url: "/garden3d/sansevieria.glb",
    plot: 2,
    height: 1.15,
    rotation: -0.45,
    wind: 0.3,
    wateredDaysAgo: 16,
    wateringIntervalDays: 14,
    daysOwned: 92,
  },
  {
    id: "pufi",
    name: "Pufi",
    species: "Echeveria elegans",
    url: "/garden3d/echeveria.glb",
    plot: 4,
    height: 0.52,
    rotation: 0.9,
    wind: 0.12,
    wateredDaysAgo: 19,
    wateringIntervalDays: 12,
    daysOwned: 41,
  },
  {
    id: "iedera",
    name: "Iedera",
    species: "Epipremnum aureum",
    url: "/garden3d/pothos.glb",
    plot: 7,
    height: 0.88,
    rotation: -1,
    wind: 0.85,
    wateredDaysAgo: 1,
    wateringIntervalDays: 7,
    daysOwned: 230,
  },
];
