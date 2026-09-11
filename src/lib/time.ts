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
