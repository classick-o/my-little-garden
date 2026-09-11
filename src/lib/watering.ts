/**
 * Calculele legate de udare.
 *
 * Tot ce e aici e determinist si nu are nevoie de AI (first-context.md
 * sectiunea 70). "Udata acum 3 zile" e aritmetica, nu inteligenta artificiala.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Cate zile de intarziere toleram inainte sa marcam planta ca avand nevoie de
 * atentie, nu doar de apa. O zi in plus nu e o drama; o saptamana e.
 */
const OVERDUE_GRACE_DAYS = 4;

export type PlantWateringInput = {
  lastWateredAt: Date | null;
  wateringIntervalDays: number;
};

/**
 * Starea plantei, dedusa din programul de udare.
 *
 * "thriving" din sectiunea 46 lipseste intentionat: ar avea nevoie de semnale
 * pe care V1 nu le are inca (frunze noi, observatii repetate). Nu inventam o
 * stare pe care nu o putem sustine.
 */
export type CareStatus = "healthy" | "needs_water" | "needs_attention";

/** Cand urmeaza udarea. Null daca planta nu a fost udata niciodata. */
export function nextWateringAt({
  lastWateredAt,
  wateringIntervalDays,
}: PlantWateringInput): Date | null {
  if (!lastWateredAt) return null;

  return new Date(lastWateredAt.getTime() + wateringIntervalDays * MS_PER_DAY);
}

/**
 * Cate zile au trecut de la ultima udare. Null daca nu a fost udata niciodata.
 * Rotunjit in jos: "acum 3 zile" inseamna cel putin 3 zile intregi.
 */
export function daysSinceWatering(
  lastWateredAt: Date | null,
  now: Date = new Date(),
): number | null {
  if (!lastWateredAt) return null;

  return Math.floor((now.getTime() - lastWateredAt.getTime()) / MS_PER_DAY);
}

/**
 * Cate zile mai sunt pana la udare.
 *
 * Negativ inseamna intarziere. Null inseamna ca planta nu a fost udata
 * niciodata, deci nu avem de la ce sa pornim.
 */
export function daysUntilWatering(
  plant: PlantWateringInput,
  now: Date = new Date(),
): number | null {
  const next = nextWateringAt(plant);
  if (!next) return null;

  return Math.ceil((next.getTime() - now.getTime()) / MS_PER_DAY);
}

/** Are nevoie de apa acum? O planta neudata niciodata are. */
export function isDueForWatering(
  plant: PlantWateringInput,
  now: Date = new Date(),
): boolean {
  const next = nextWateringAt(plant);
  if (!next) return true;

  return now.getTime() >= next.getTime();
}

export function careStatus(
  plant: PlantWateringInput,
  now: Date = new Date(),
): CareStatus {
  const remaining = daysUntilWatering(plant, now);

  /* Neudata niciodata: are nevoie de apa, dar nu e un semnal de alarma. */
  if (remaining === null) return "needs_water";

  if (remaining < -OVERDUE_GRACE_DAYS) return "needs_attention";
  if (remaining <= 0) return "needs_water";

  return "healthy";
}
