/**
 * Adresa si cheia publica Supabase.
 *
 * Valorile se scriu ca `process.env.NEXT_PUBLIC_...` cuvant cu cuvant: Next le
 * inlocuieste textual la build. Citite dinamic, ar ramane nedefinite in browser.
 *
 * Verificarea de aici e ieftina si opreste aplicatia la pornire, nu la primul
 * apel esuat, undeva adanc intr-un ecran.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Lipsesc NEXT_PUBLIC_SUPABASE_URL sau NEXT_PUBLIC_SUPABASE_ANON_KEY. Vezi docs/setup.md.",
  );
}

export const SUPABASE_URL = url;
export const SUPABASE_ANON_KEY = anonKey;
