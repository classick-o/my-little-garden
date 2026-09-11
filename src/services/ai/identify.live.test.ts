import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { aiService, confidenceLevel } from "./index";

/**
 * Verificare cu cerere reala catre Gemini.
 *
 *   npm run smoke:ai
 *
 * NU ruleaza in CI si nu e inclusa in `npm test`: consuma cota si depinde de un
 * serviciu extern. Se ruleaza manual, dupa ce s-a schimbat un prompt, schema
 * sau modelul, ca sa vedem ce raspunde modelul cu adevarat - nu doar ca se
 * compileaza codul.
 *
 * Are nevoie de .env.local completat.
 */

/* Poza de test se descarca o singura data, intr-un folder ignorat de git.
   Nu o comitem: e de pe Wikimedia Commons si nu vrem sa carem in repo un
   fisier cu licenta pe care ar trebui sa o urmarim. */
const FIXTURES = path.join(process.cwd(), ".fixtures");
const IMAGE = path.join(FIXTURES, "monstera.jpg");
const IMAGE_URL =
  "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/64/Monstera_deliciosa_DSC02605.jpg/960px-Monstera_deliciosa_DSC02605.jpg";

/* Diacriticele romanesti, in ambele variante Unicode: cu sedila (ş, ţ), cum
   scriu multe tastaturi, si cu virgula dedesubt (ș, ț), forma corecta. */
const DIACRITICS = /[ăâîşșţțĂÂÎŞȘŢȚ]/;

async function plantPhoto(): Promise<string> {
  if (!existsSync(IMAGE)) {
    mkdirSync(FIXTURES, { recursive: true });

    const response = await fetch(IMAGE_URL, {
      headers: { "User-Agent": "my-little-garden-dev/0.1" },
    });

    if (!response.ok) {
      throw new Error(`Nu am putut descarca poza de test: ${response.status}`);
    }

    writeFileSync(IMAGE, Buffer.from(await response.arrayBuffer()));
  }

  return readFileSync(IMAGE).toString("base64");
}

describe("identifyPlant, cerere reala catre Gemini", () => {
  it("recunoaste o Monstera si raspunde in romana", { timeout: 120_000 }, async () => {
    const { data, meta } = await aiService().identifyPlant({
      base64: await plantPhoto(),
      mimeType: "image/jpeg",
    });

    console.log(`\nmodel: ${meta.model}  prompt: ${meta.promptVersion}`);
    console.log(JSON.stringify(data, null, 2));
    console.log(`nivel de incredere: ${confidenceLevel(data.confidence)}\n`);

    expect(data.is_plant).toBe(true);
    expect(data.scientific_name.toLowerCase()).toContain("monstera");

    /* Poza e clara si planta e inconfundabila: daca modelul ezita aici,
       inseamna ca prompt-ul despre incredere nu e inteles. */
    expect(confidenceLevel(data.confidence)).toBe("high");

    /* Romana fara diacritice (CLAUDE.md sectiunea 2). Verificam tot textul
       adresat utilizatorului. */
    const userFacingText = [
      ...Object.values(data.care),
      ...data.interesting_facts,
    ].join(" ");

    expect(userFacingText).not.toMatch(DIACRITICS);

    /* Lucrurile interesante nu trebuie sa repete sfaturile de ingrijire. */
    expect(data.interesting_facts.length).toBeGreaterThan(0);
  });
});
