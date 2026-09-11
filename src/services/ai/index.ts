import "server-only";

import { createGeminiService } from "./gemini";
import type { AIService } from "./types";

/**
 * Punctul unic de acces la AI.
 *
 * Aplicatia cere serviciul de aici si nu stie ce furnizor e in spate. Ca sa
 * schimbam furnizorul, schimbam o singura linie in functia de mai jos.
 */

let service: AIService | null = null;

export function aiService(): AIService {
  service ??= createGeminiService();
  return service;
}

export { AIError, type AIErrorCode } from "./errors";
export {
  confidenceLevel,
  type CareAdvice,
  type ConfidenceLevel,
  type PlantIdentification,
} from "./schemas";
export type { AIResult, ImageInput } from "./types";
