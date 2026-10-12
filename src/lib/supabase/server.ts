import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";
import type { Database } from "./database";

/**
 * Clientul Supabase pentru server: componente server, actiuni server si
 * Route Handlers.
 *
 * Vorbeste in numele utilizatorului conectat, deci RLS se aplica. Tot ce e aici
 * trece prin politicile din migratii - nu exista scurtatura.
 *
 * In Next 16 `cookies()` e asincron. Accesul sincron a fost eliminat complet.
 */
export async function supabaseServer() {
  const store = await cookies();

  return createServerClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (cookiesToSet) => {
          try {
            for (const { name, value, options } of cookiesToSet) {
              store.set(name, value, options);
            }
          } catch {
            /* Componentele server nu pot scrie cookie-uri. Nu e o problema:
               reimprospatarea sesiunii se face in proxy, inainte de randare. */
          }
        },
      },
    },
  );
}

/**
 * Utilizatorul conectat, sau null.
 *
 * Se foloseste `getUser`, nu `getSession`: sesiunea din cookie poate fi
 * falsificata, `getUser` o verifica la Supabase.
 */
export async function currentUser() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/**
 * La fel, dar arunca daca nu e nimeni conectat.
 *
 * Pentru actiunile server: fara el, fiecare actiune ar trebui sa trateze
 * cazul "nu e nimeni", desi proxy-ul l-a oprit deja la usa.
 */
export async function requireUser() {
  const user = await currentUser();
  if (!user) throw new Error("Nu esti conectat.");
  return user;
}
