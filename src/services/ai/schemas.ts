import { z } from "zod";

/**
 * Formele raspunsurilor AI de care depinde logica aplicatiei.
 *
 * Aceeasi schema are doua roluri (first-context.md sectiunile 25, 17):
 *   1. e trimisa modelului ca JSON Schema, ca sa raspunda structurat
 *   2. valideaza raspunsul inainte sa fie afisat sau salvat
 *
 * Nimic din ce vine de la model nu ajunge in baza de date nevalidat.
 */

/** Cat de sigur e modelul. Derivat din scor, nu cerut modelului direct. */
export const CONFIDENCE_LEVELS = ["high", "medium", "low"] as const;
export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];

export function confidenceLevel(score: number): ConfidenceLevel {
  if (score >= 0.8) return "high";
  if (score >= 0.5) return "medium";
  return "low";
}

/** Sfaturile de ingrijire, in cuvinte. Afisate ca atare pe ecranul plantei. */
export const careAdviceSchema = z.object({
  light: z.string().max(120),
  watering: z.string().max(120),
  humidity: z.string().max(120),
  temperature: z.string().max(120),
});

export type CareAdvice = z.infer<typeof careAdviceSchema>;

export const SUNLIGHT_LEVELS = [
  "low",
  "medium",
  "bright_indirect",
  "direct",
] as const;

export const plantIdentificationSchema = z.object({
  /* Modelul primeste si poze care nu contin plante. Il lasam sa spuna asta,
     in loc sa inventeze un rezultat (sectiunea 26). */
  is_plant: z.boolean(),

  common_name: z.string().max(80),
  scientific_name: z.string().max(120),

  /* Incredere reala, nu politete. Prompt-ul cere explicit valori mici cand
     poza e neclara. */
  confidence: z.number().min(0).max(1),

  care: careAdviceSchema,

  /* Programul de udare, ca numar - il folosim ca sa precompletam intervalul.
     Restul sfaturilor raman text (sectiunea 70). */
  suggested_watering_interval_days: z.number().int().min(1).max(365),

  suggested_sunlight: z.enum(SUNLIGHT_LEVELS),

  interesting_facts: z.array(z.string().max(200)).min(1).max(3),
});

export type PlantIdentification = z.infer<typeof plantIdentificationSchema>;

/**
 * Converteste o schema Zod in JSON Schema pentru Gemini.
 *
 * Gemini accepta doar un subset din JSON Schema si nu recunoaste `$schema`,
 * pe care Zod il adauga implicit.
 */
export function toGeminiSchema(schema: z.ZodType): Record<string, unknown> {
  const jsonSchema = z.toJSONSchema(schema, { target: "draft-2020-12" }) as Record<
    string,
    unknown
  >;

  const { $schema: _ignored, ...rest } = jsonSchema;
  return rest;
}
