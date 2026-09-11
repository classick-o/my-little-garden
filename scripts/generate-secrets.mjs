/**
 * Genereaza secretele care nu se iau de la niciun serviciu, ci se creeaza local:
 * perechea de chei VAPID pentru notificari si secretul care protejeaza ruta de cron.
 *
 *   npm run secrets
 *
 * Scrie direct in .env.local, fara sa afiseze valorile secrete in terminal.
 * Daca fisierul nu exista, il creeaza pornind de la .env.example.
 *
 * Valorile deja completate nu sunt atinse. Ca sa le inlocuiesti:
 *
 *   npm run secrets -- --force
 *
 * Atentie: daca schimbi cheile VAPID, telefoanele deja abonate la notificari nu
 * mai primesc nimic si trebuie sa se aboneze din nou.
 */
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import webpush from "web-push";

const ENV_FILE = ".env.local";
const TEMPLATE = ".env.example";

const force = process.argv.includes("--force");

/** Adresa folosita de serviciile de push ca sa ne contacteze in caz de probleme. */
const CONTACT_EMAIL = process.env.CONTACT_EMAIL ?? "classick0120@gmail.com";

if (!existsSync(ENV_FILE)) {
  if (!existsSync(TEMPLATE)) {
    console.error(`Lipseste si ${ENV_FILE} si ${TEMPLATE}.`);
    process.exit(1);
  }
  writeFileSync(ENV_FILE, readFileSync(TEMPLATE, "utf8"));
  console.log(`Am creat ${ENV_FILE} pornind de la ${TEMPLATE}.`);
}

let contents = readFileSync(ENV_FILE, "utf8");

/** Valoarea actuala a unei variabile, sau sirul gol daca nu e completata. */
function currentValue(key) {
  const match = contents.match(new RegExp(`^${key}=(.*)$`, "m"));
  return match ? match[1].trim() : "";
}

/**
 * Scrie o variabila in fisier, pastrand restul neatins.
 * Adauga linia la final daca variabila nu exista deja.
 */
function setValue(key, value) {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, "m");

  contents = pattern.test(contents)
    ? contents.replace(pattern, line)
    : `${contents.trimEnd()}\n${line}\n`;
}

/** Ascunde valoarea in terminal: aratam doar ca exista, nu si ce e. */
function mask(value) {
  return value.length <= 8 ? "*".repeat(value.length) : `${value.slice(0, 4)}...${"*".repeat(8)}`;
}

const vapid = webpush.generateVAPIDKeys();

const targets = [
  {
    key: "NEXT_PUBLIC_VAPID_PUBLIC_KEY",
    value: vapid.publicKey,
    // Ajunge oricum in browser prin design, deci o putem afisa intreaga.
    secret: false,
  },
  { key: "VAPID_PRIVATE_KEY", value: vapid.privateKey, secret: true },
  { key: "VAPID_SUBJECT", value: `mailto:${CONTACT_EMAIL}`, secret: false },
  { key: "CRON_SECRET", value: randomBytes(32).toString("hex"), secret: true },
];

for (const { key, value, secret } of targets) {
  const existing = currentValue(key);

  // "mailto:" fara adresa e sablonul gol, nu o valoare completata.
  const isEmpty = existing === "" || existing === "mailto:";

  if (!isEmpty && !force) {
    console.log(`  ${key}  - deja completat, nu il ating`);
    continue;
  }

  setValue(key, value);
  console.log(`  ${key}  ${secret ? mask(value) : value}`);
}

writeFileSync(ENV_FILE, contents);

console.log(`\nScrise in ${ENV_FILE}. Fisierul e ignorat de git.`);
console.log("Aceleasi valori trebuie puse si in Vercel, la Environment Variables.");
