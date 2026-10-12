import type { PlantEventType } from "@/lib/supabase/database";

/**
 * Cum se citeste un eveniment.
 *
 * Tipurile din baza sunt in engleza, ca restul identificatorilor. Textul vazut
 * de ea e in romana (CLAUDE.md sectiunea 2), si se traduce intr-un singur loc.
 */
const LABELS: Record<PlantEventType, string> = {
  created: "a intrat in gradina",
  watered: "a fost udata",
  photo_added: "o poza noua",
  note_added: "o insemnare",
  fertilized: "a primit ingrasamant",
  repotted: "a fost mutata in alt ghiveci",
  pruned: "a fost tunsa",
  moved: "si-a schimbat locul",
  ai_analysis: "a fost analizata de asistent",
};

export function eventLabel(type: PlantEventType): string {
  return LABELS[type];
}

/** Textul insemnarii, daca evenimentul e o insemnare si chiar are text. */
export function noteText(metadata: Record<string, unknown>): string | null {
  const text = metadata.text;
  return typeof text === "string" && text.trim() ? text : null;
}
