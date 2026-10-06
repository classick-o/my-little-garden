/**
 * Culorile cu inteles din interfata.
 *
 * Nu sunt culori oarecare: fiecare spune ceva. Apa e albastra, planta sanatoasa
 * e verde, intarzierea e galbena, problema e rosie. Aceleasi patru peste tot,
 * ca utilizatorul sa nu reinvete codul pe fiecare ecran.
 */
export type Tone = "leaf" | "water" | "sun" | "wilt";

/** Fundalul discret al unei pastile sau al unei iconite. */
export const TONE_SOFT: Record<Tone, string> = {
  leaf: "bg-leaf-soft text-leaf",
  water: "bg-water-soft text-water",
  sun: "bg-sun-soft text-sun",
  wilt: "bg-wilt-soft text-wilt",
};

/** Conturul unui inel de progres. */
export const TONE_STROKE: Record<Tone, string> = {
  leaf: "stroke-leaf",
  water: "stroke-water",
  sun: "stroke-sun",
  wilt: "stroke-wilt",
};
