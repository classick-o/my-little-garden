/**
 * Arata ce modele Gemini poate folosi cheia din .env.local.
 *
 *   npm run models
 *
 * Lista din documentatie e generala; asta e lista reala pentru cheia ta.
 * Valoarea aleasa se pune in .env.local la GEMINI_MODEL.
 */
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error(
    "GEMINI_API_KEY lipseste. Ruleaza cu: node --env-file=.env.local scripts/list-models.mjs",
  );
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

const models = [];

for await (const model of await ai.models.list()) {
  const actions = model.supportedActions ?? [];

  // Ne intereseaza doar modelele care pot raspunde la o cerere obisnuita.
  // Cele de embedding sau de generat imagini nu ne folosesc aici.
  if (actions.length > 0 && !actions.includes("generateContent")) continue;

  models.push({
    name: (model.name ?? "").replace(/^models\//, ""),
    input: model.inputTokenLimit ?? 0,
    output: model.outputTokenLimit ?? 0,
  });
}

models.sort((a, b) => a.name.localeCompare(b.name));

console.log(`\n${models.length} modele disponibile pentru cheia ta:\n`);

for (const model of models) {
  const limits = `${String(model.input).padStart(9)} tokenuri in / ${String(
    model.output,
  ).padStart(6)} out`;
  console.log(`  ${model.name.padEnd(44)} ${limits}`);
}

console.log(
  "\nPune numele dorit in .env.local la GEMINI_MODEL. Implicit: gemini-2.5-flash.\n",
);
