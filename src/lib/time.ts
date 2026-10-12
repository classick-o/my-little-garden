/** Fusul orar al utilizatorului. Aplicatia are un singur utilizator, in Romania. */
export const TIME_ZONE = "Europe/Bucharest";

/** Ora curenta (0-23) in fusul orar al utilizatorului, nu al serverului. */
export function currentHour(now: Date = new Date()): number {
  const formatted = new Intl.DateTimeFormat("ro-RO", {
    timeZone: TIME_ZONE,
    hour: "numeric",
    hour12: false,
  }).format(now);

  return Number.parseInt(formatted, 10);
}

/**
 * Salutul de pe ecranul Gradina.
 * Fara diacritice - vezi CLAUDE.md sectiunea 2.
 */
export function greeting(now: Date = new Date()): string {
  const hour = currentHour(now);

  if (hour < 5) return "Noapte buna";
  if (hour < 12) return "Buna dimineata";
  if (hour < 18) return "Buna ziua";
  return "Buna seara";
}

/**
 * Cat de demult, in cuvinte: "azi", "ieri", "acum 3 zile".
 *
 * Zilele intregi sunt destule pentru ingrijirea plantelor; orele ar da o
 * precizie falsa. Null inseamna ca nu s-a intamplat niciodata.
 */
export function daysAgoLabel(days: number | null): string {
  if (days === null) return "niciodata";
  if (days <= 0) return "azi";
  if (days === 1) return "ieri";
  return `acum ${days} zile`;
}

/**
 * Cand urmeaza, in cuvinte: "azi", "maine", "in 4 zile", "acum 2 zile".
 *
 * Negativ inseamna intarziere, si o spunem ca atare - nu "in -2 zile".
 */
export function dueLabel(daysLeft: number | null): string {
  if (daysLeft === null) return "cand vrei tu";
  if (daysLeft === 0) return "azi";
  if (daysLeft === 1) return "maine";
  if (daysLeft > 1) return `in ${daysLeft} zile`;

  const late = -daysLeft;
  return late === 1 ? "de ieri" : `de acum ${late} zile`;
}

/** Data scurta pentru jurnal: "12 oct". */
export function shortDate(date: Date): string {
  return new Intl.DateTimeFormat("ro-RO", {
    timeZone: TIME_ZONE,
    day: "numeric",
    month: "short",
  })
    .format(date)
    .replace(".", "");
}
