/**
 * Verifica faptul ca schema e aplicata si ca Row Level Security chiar blocheaza.
 *
 *   npm run verify:db
 *
 * De rulat dupa fiecare migratie. "Migratia a rulat fara eroare" nu inseamna
 * ca politicile fac ce credem noi ca fac.
 */
import { readFileSync } from "node:fs";

function env() {
  return Object.fromEntries(
    readFileSync(".env.local", "utf8")
      .split("\n")
      .filter((line) => line.includes("=") && !line.trim().startsWith("#"))
      .map((line) => {
        const at = line.indexOf("=");
        return [line.slice(0, at).trim(), line.slice(at + 1).trim()];
      }),
  );
}

const { NEXT_PUBLIC_SUPABASE_URL: url, NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey, SUPABASE_SERVICE_ROLE_KEY: serviceKey } = env();

if (!url || !anonKey || !serviceKey) {
  console.error("Lipsesc variabile Supabase din .env.local.");
  process.exit(1);
}

/** Tabelele pe care migratia initiala trebuie sa le fi creat. */
const EXPECTED_TABLES = [
  "profiles",
  "plants",
  "plant_photos",
  "plant_events",
  "plant_ai_analysis",
];

let failures = 0;

function report(ok, label, detail = "") {
  if (!ok) failures++;
  console.log(`  ${ok ? "OK  " : "ESEC"}  ${label}${detail ? ` - ${detail}` : ""}`);
}

// --- 1. Tabelele exista ------------------------------------------------------
console.log("\nSchema:");

const spec = await fetch(`${url}/rest/v1/`, {
  headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
}).then((r) => r.json());

const tables = Object.keys(spec.definitions ?? spec.components?.schemas ?? {});

for (const table of EXPECTED_TABLES) {
  report(tables.includes(table), `tabelul ${table}`);
}

report(tables.includes("allowed_emails"), "tabelul allowed_emails");

// --- 2. RLS blocheaza un client neautentificat -------------------------------
console.log("\nRow Level Security (client anonim, fara utilizator):");

for (const table of EXPECTED_TABLES) {
  const response = await fetch(`${url}/rest/v1/${table}?select=*&limit=1`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
  });

  const rows = response.ok ? await response.json() : null;

  // Fara utilizator autentificat, auth.uid() e null: politicile nu se potrivesc
  // cu niciun rand, deci raspunsul trebuie sa fie o lista goala.
  report(
    response.ok && Array.isArray(rows) && rows.length === 0,
    `citire din ${table} nu intoarce nimic`,
    response.ok ? `${rows?.length ?? "?"} randuri` : `HTTP ${response.status}`,
  );
}

// Scrierea trebuie respinsa, nu doar sa intoarca gol.
const insert = await fetch(`${url}/rest/v1/plants`, {
  method: "POST",
  headers: {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ name: "planta de test", user_id: crypto.randomUUID() }),
});

report(
  insert.status === 401 || insert.status === 403,
  "scriere in plants respinsa",
  `HTTP ${insert.status}`,
);

/* allowed_emails are RLS activ si nicio politica, deci nimeni nu il poate citi
   prin API - nici macar un utilizator autentificat. Il verificam separat
   fiindca de el depinde cine poate intra in aplicatie. */
const accessList = await fetch(`${url}/rest/v1/allowed_emails?select=email`, {
  headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
});
const accessRows = accessList.ok ? await accessList.json() : null;

report(
  !accessList.ok || (Array.isArray(accessRows) && accessRows.length === 0),
  "lista de acces nu poate fi citita din afara",
  accessList.ok ? `${accessRows?.length ?? "?"} randuri` : `HTTP ${accessList.status}`,
);

// --- 3. Bucketul de poze exista si e privat ----------------------------------
console.log("\nStorage:");

const buckets = await fetch(`${url}/storage/v1/bucket`, {
  headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
}).then((r) => (r.ok ? r.json() : []));

const photos = Array.isArray(buckets)
  ? buckets.find((b) => b.id === "plant-photos")
  : null;

report(Boolean(photos), "bucketul plant-photos exista");
report(photos ? photos.public === false : false, "bucketul e privat");

console.log(
  failures === 0
    ? "\nTotul e in regula.\n"
    : `\n${failures} verificari au esuat.\n`,
);

process.exit(failures === 0 ? 0 : 1);
