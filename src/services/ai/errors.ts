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
  /** Modelul e supraincarcat. Trece de la sine, merita reincercat. */
  "unavailable",
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
  unavailable:
    "Asistentul e foarte cerut chiar acum. Mai incearca peste un minut.",
  bad_input:
    "Poza nu a putut fi citita. Incearca sa o faci din nou, cu mai multa lumina.",
  unknown: "Ceva nu a mers bine. Mai incearca o data.",
};

/** Erorile care trec de la sine si au sens sa fie reincercate. */
const RETRYABLE: ReadonlySet<AIErrorCode> = new Set(["unavailable"]);

export class AIError extends Error {
  readonly code: AIErrorCode;

  /** Mesajul afisat utilizatorului, in romana fara diacritice. */
  readonly userMessage: string;

  /** Are sens sa incercam din nou imediat? */
  readonly retryable: boolean;

  constructor(code: AIErrorCode, cause?: unknown) {
    super(`AIError: ${code}`, { cause });
    this.name = "AIError";
    this.code = code;
    this.userMessage = USER_MESSAGES[code];
    this.retryable = RETRYABLE.has(code);
  }
}

/**
 * Codul HTTP al erorii, daca SDK-ul il expune.
 *
 * Preferam codul numeric in locul cautarii in text: mesajele se schimba de la o
 * versiune la alta, iar cuvintele se suprapun inselator - "generateContent"
 * contine "rate", de exemplu.
 */
function statusOf(error: unknown): number | null {
  if (typeof error !== "object" || error === null) return null;

  const status = (error as { status?: unknown }).status;
  return typeof status === "number" ? status : null;
}

/** Traduce o eroare venita de la SDK intr-un cod al nostru. */
export function classifyProviderError(error: unknown): AIError {
  if (error instanceof AIError) return error;

  switch (statusOf(error)) {
    case 400:
      return new AIError("bad_input", error);
    case 401:
    case 403:
      return new AIError("not_configured", error);
    case 429:
      return new AIError("rate_limited", error);
    case 500:
    case 502:
    case 503:
    case 504:
      return new AIError("unavailable", error);
  }

  /* Fara cod numeric ne uitam in mesaj, dar cu termeni suficient de specifici
     cat sa nu se potriveasca din greseala. */
  const message = (error instanceof Error ? error.message : String(error)).toLowerCase();

  if (message.includes("quota") || message.includes("resource_exhausted")) {
    return new AIError("rate_limited", error);
  }

  if (message.includes("unavailable") || message.includes("overloaded")) {
    return new AIError("unavailable", error);
  }

  if (message.includes("safety") || message.includes("blocked")) {
    return new AIError("blocked", error);
  }

  if (message.includes("api key") || message.includes("api_key")) {
    return new AIError("not_configured", error);
  }

  return new AIError("unknown", error);
}
