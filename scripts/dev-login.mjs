/**
 * Genereaza o legatura de intrare pentru dezvoltare locala.
 *
 * Clientul Google OAuth nu exista inca, deci conectarea obisnuita nu merge.
 * Scriptul cere Supabase un jeton de unica folosinta pentru o adresa aflata pe
 * lista de acces si tipareste legatura catre /auth/confirm.
 *
 * Cheia de serviciu ramane aici, in terminal. Nu ajunge niciodata in browser.
 *
 *   npm run dev:login -- adresa@exemplu.com
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function env() {
  const out = {};
  try {
    for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
      const match = line.match(/^([A-Z_0-9]+)=(.*)$/);
      if (match) out[match[1]] = match[2].trim();
    }
  } catch {
    /* Fara .env.local mergem pe ce e deja in mediu. */
  }
  return { ...out, ...process.env };
}

const {
  NEXT_PUBLIC_SUPABASE_URL: url,
  SUPABASE_SERVICE_ROLE_KEY: serviceKey,
  NEXT_PUBLIC_SITE_URL: siteUrl,
} = env();

const email = process.argv[2];

if (!email) {
  console.error("Lipseste adresa. Foloseste: npm run dev:login -- adresa@exemplu.com");
  process.exit(1);
}

if (!url || !serviceKey) {
  console.error("Lipsesc NEXT_PUBLIC_SUPABASE_URL sau SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/* Adresa trebuie sa fie pe lista, altfel declansatorul din baza refuza
   crearea contului - si e bine ca o face. */
const { data: allowed, error: listError } = await supabase
  .from("allowed_emails")
  .select("email")
  .ilike("email", email);

/* Esecul cererii si lista goala arata la fel daca nu te uiti la eroare, si
   atunci o problema de retea apare ca "adresa nu e pe lista". */
if (listError) {
  console.error("Nu s-a putut citi lista de acces:", listError.message);
  process.exit(1);
}

if (!allowed?.length) {
  console.error(`Adresa ${email} nu e in allowed_emails. Adaug-o intai acolo.`);
  process.exit(1);
}

const { data, error } = await supabase.auth.admin.generateLink({
  type: "magiclink",
  email,
});

if (error) {
  console.error("Nu s-a putut genera jetonul:", error.message);
  process.exit(1);
}

const base = siteUrl?.replace(/\/$/, "") || "http://localhost:3000";
const link = new URL("/auth/confirm", base);
link.searchParams.set("token_hash", data.properties.hashed_token);
link.searchParams.set("type", "magiclink");

console.log("\nDeschide legatura asta in browser ca sa intri:\n");
console.log(link.toString());
console.log("\nE de unica folosinta si expira. Ruleaza din nou pentru alta.\n");
