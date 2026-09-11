/**
 * Verifica faptul ca .env.example nu contine valori reale.
 *
 *   npm run check:env
 *
 * .env.example e comis in repo. Daca cineva completeaza o cheie acolo in loc de
 * .env.local, secretul ajunge public. S-a intamplat deja o data; verificarea
 * asta ruleaza in CI ca sa nu se mai intample.
 */
import { readFileSync } from "node:fs";

const FILE = ".env.example";

/**
 * Valorile care au voie sa apara: sunt sabloane, nu secrete.
 * Orice altceva e considerat o scapare.
 */
const ALLOWED = new Map([
  ["VAPID_SUBJECT", "mailto:"],
  ["NEXT_PUBLIC_SITE_URL", "http://localhost:3000"],
]);

const offenders = [];

readFileSync(FILE, "utf8")
  .split("\n")
  .forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) return;

    const separator = line.indexOf("=");
    if (separator === -1) return;

    const key = line.slice(0, separator);
    const value = line.slice(separator + 1).trim();

    if (value === "") return;
    if (ALLOWED.get(key) === value) return;

    offenders.push({ line: index + 1, key });
  });

if (offenders.length > 0) {
  console.error(`\n${FILE} contine valori care nu ar trebui sa fie acolo:\n`);
  for (const { line, key } of offenders) {
    console.error(`  linia ${line}: ${key}`);
  }
  console.error(
    `\n${FILE} e comis in repo si trebuie sa ramana un sablon gol.` +
      "\nMuta valorile in .env.local, care e ignorat de git." +
      "\nDaca o cheie reala a ajuns deja intr-un commit, regenereaz-o.\n",
  );
  process.exit(1);
}

console.log(`${FILE} nu contine valori reale.`);
