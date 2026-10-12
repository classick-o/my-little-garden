import "server-only";

import { createClient } from "@supabase/supabase-js";

import { serverEnv } from "@/lib/env";
import { SUPABASE_URL } from "./config";
import type { Database } from "./database";

/**
 * Clientul cu drepturi depline. Ocoleste RLS.
 *
 * Se foloseste numai acolo unde nu exista utilizator conectat si treaba tot
 * trebuie facuta: cron-ul de notificari si uneltele de dezvoltare.
 *
 * `server-only` opreste build-ul daca fisierul ajunge vreodata intr-un pachet
 * de browser. Fara el, greseala s-ar vedea abia in productie.
 */
export function supabaseAdmin() {
  return createClient<Database>(
    SUPABASE_URL,
    serverEnv().SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
