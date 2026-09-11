import "server-only";

import { GoogleGenAI } from "@google/genai";

import { serverEnv } from "@/lib/env";
import { AIError, classifyProviderError } from "./errors";
import { PLANT_IDENTIFICATION } from "./prompts";
import {
  plantIdentificationSchema,
  toGeminiSchema,
  type PlantIdentification,
} from "./schemas";
import type { AIResult, AIService, ImageInput } from "./types";

/**
 * Implementarea Gemini a contractului AIService.
 *
 * Tot ce e specific Gemini se opreste aici. Restul aplicatiei vede doar
 * interfata din types.ts (first-context.md sectiunea 5).
 */

/* Schema se calculeaza o singura data, nu la fiecare cerere. */
const IDENTIFICATION_RESPONSE_SCHEMA = toGeminiSchema(plantIdentificationSchema);

/* Cate incercari facem cand modelul e supraincarcat. Al doilea 503 la rand
   inseamna de obicei ca nu trece imediat, deci nu insistam mai mult - poza a
   fost deja incarcata si utilizatorul asteapta. */
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1200;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Reincearca doar erorile despre care stim ca trec de la sine. */
async function withRetry<T>(operation: () => Promise<T>): Promise<T> {
  let lastError: AIError | undefined;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = classifyProviderError(error);

      if (!lastError.retryable || attempt === MAX_ATTEMPTS) break;

      await wait(RETRY_DELAY_MS * attempt);
    }
  }

  throw lastError ?? new AIError("unknown");
}

let client: GoogleGenAI | null = null;

function geminiClient(apiKey: string): GoogleGenAI {
  client ??= new GoogleGenAI({ apiKey });
  return client;
}

export function createGeminiService(): AIService {
  const env = serverEnv();
  const ai = geminiClient(env.GEMINI_API_KEY);

  return {
    async identifyPlant(
      image: ImageInput,
    ): Promise<AIResult<PlantIdentification>> {
      const rawText = await withRetry(async () => {
        const response = await ai.models.generateContent({
          model: env.GEMINI_MODEL,
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    mimeType: image.mimeType,
                    data: image.base64,
                  },
                },
              ],
            },
          ],
          config: {
            systemInstruction: PLANT_IDENTIFICATION.instruction,
            responseMimeType: "application/json",
            responseJsonSchema: IDENTIFICATION_RESPONSE_SCHEMA,
            /* Identificarea e o sarcina de precizie, nu de creativitate. */
            temperature: 0.2,
          },
        });

        return response.text;
      });

      if (!rawText) {
        throw new AIError("invalid_response");
      }

      return {
        data: parseIdentification(rawText),
        meta: {
          model: env.GEMINI_MODEL,
          promptVersion: PLANT_IDENTIFICATION.version,
        },
      };
    },
  };
}

/**
 * Validarea raspunsului. Nimic nu iese de aici daca nu respecta schema
 * (sectiunile 25, 81 - regula 17).
 */
function parseIdentification(rawText: string): PlantIdentification {
  let json: unknown;

  try {
    json = JSON.parse(rawText);
  } catch (error) {
    throw new AIError("invalid_response", error);
  }

  const parsed = plantIdentificationSchema.safeParse(json);

  if (!parsed.success) {
    throw new AIError("invalid_response", parsed.error);
  }

  return parsed.data;
}
