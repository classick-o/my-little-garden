import "server-only";

import { z } from "zod";

/**
 * Variabilele de mediu de pe server, validate la prima folosire.
 *
 * `import "server-only"` face ca build-ul sa esueze daca fisierul asta ajunge
 * din greseala intr-o componenta de client. Secretele nu au ce cauta in browser
 * (first-context.md sectiunile 66, 81 - regulile 6 si 7).
 *
 * Valorile publice, cele cu NEXT_PUBLIC_, se citesc direct din process.env
 * acolo unde e nevoie - ele ajung oricum in browser prin design.
 */

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),

  /* Modelul se poate schimba fara sa modificam codul. Verifica in Google AI
     Studio ce modele are cheia ta pe planul gratuit inainte sa il schimbi. */
  GEMINI_MODEL: z.string().min(1).default("gemini-2.5-flash"),
});

type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | null = null;

/**
 * Intoarce variabilele de mediu validate.
 *
 * Arunca o eroare descriptiva la pornire daca lipseste ceva, in loc sa esueze
 * mai tarziu cu un "undefined" greu de urmarit.
 */
export function serverEnv(): ServerEnv {
  if (cached) return cached;

  const parsed = serverEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    const missing = Object.keys(parsed.error.flatten().fieldErrors).join(", ");
    throw new Error(
      `Variabile de mediu lipsa sau invalide: ${missing}. Vezi docs/setup.md.`,
    );
  }

  cached = parsed.data;
  return cached;
}
