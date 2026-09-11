/**
 * Erorile stratului de AI.
 *
 * Fiecare eroare are doua fete: un cod pentru loguri si un mesaj pe care il
 * poate citi utilizatorul. Mesajele tehnice nu ajung niciodata pe ecran
 * (first-context.md sectiunea 64).
 */

export const AI_ERROR_CODES = [
  /** Lipseste GEMINI_API_KEY. Problema de configurare, nu a utilizatorului. */
  "not_configured",
  /** Am depasit cota sau am trimis prea multe cereri. */
  "rate_limited",
  /** Modelul a raspuns, dar raspunsul nu respecta schema. */
  "invalid_response",
  /** Continutul a fost blocat de filtrele de siguranta. */
  "blocked",
  /** Poza e prea mare sau intr-un format nepotrivit. */
  "bad_input",
  /** Orice altceva. */
  "unknown",
] as const;

export type AIErrorCode = (typeof AI_ERROR_CODES)[number];

const USER_MESSAGES: Record<AIErrorCode, string> = {
  not_configured:
    "Asistentul nu e disponibil momentan. Revino putin mai tarziu.",
  rate_limited:
    "Asistentul a avut multe cereri acum. Mai incearca peste cateva minute.",
  invalid_response:
    "Nu am reusit sa recunosc planta de data asta. Incearca o poza mai clara, cu frunzele vizibile.",
  blocked: "Nu pot analiza poza asta. Incearca cu alta.",
  bad_input:
    "Poza nu a putut fi citita. Incearca sa o faci din nou, cu mai multa lumina.",
  unknown: "Ceva nu a mers bine. Mai incearca o data.",
};

export class AIError extends Error {
  readonly code: AIErrorCode;

  /** Mesajul afisat utilizatorului, in romana fara diacritice. */
  readonly userMessage: string;

  constructor(code: AIErrorCode, cause?: unknown) {
    super(`AIError: ${code}`, { cause });
    this.name = "AIError";
    this.code = code;
    this.userMessage = USER_MESSAGES[code];
  }
}

/** Traduce o eroare venita de la SDK intr-un cod al nostru. */
export function classifyProviderError(error: unknown): AIError {
  if (error instanceof AIError) return error;

  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();

  if (lower.includes("429") || lower.includes("quota") || lower.includes("rate")) {
    return new AIError("rate_limited", error);
  }

  if (lower.includes("safety") || lower.includes("blocked")) {
    return new AIError("blocked", error);
  }

  if (lower.includes("api key") || lower.includes("401") || lower.includes("403")) {
    return new AIError("not_configured", error);
  }

  return new AIError("unknown", error);
}
