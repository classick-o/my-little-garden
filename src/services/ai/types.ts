import type { PlantIdentification } from "./schemas";

/**
 * Contractul stratului de AI (first-context.md sectiunea 5).
 *
 * Nimic specific Gemini nu iese in afara acestui modul. Daca schimbam furnizorul,
 * scriem o alta implementare a acestei interfete si restul aplicatiei nu afla.
 *
 * In V1 exista o singura operatie - identificarea plantei (sectiunea 72).
 * Analiza de sanatate, chat-ul si sfaturile de ingrijire vin in V1.5 si se vor
 * adauga aici.
 */

/** O imagine pregatita pentru model: deja micsorata si comprimata. */
export type ImageInput = {
  /** Continutul imaginii codificat base64, fara prefixul `data:`. */
  base64: string;
  mimeType: "image/webp" | "image/jpeg" | "image/png";
};

/** Ce s-a intamplat cu o cerere, indiferent de rezultat. Se salveaza langa el. */
export type AICallMetadata = {
  model: string;
  promptVersion: string;
};

export type AIResult<T> = {
  data: T;
  meta: AICallMetadata;
};

export interface AIService {
  /**
   * Recunoaste planta dintr-o fotografie.
   *
   * Arunca AIError daca modelul nu raspunde sau daca raspunsul nu trece
   * validarea. Nu intoarce niciodata date nevalidate.
   */
  identifyPlant(image: ImageInput): Promise<AIResult<PlantIdentification>>;
}
