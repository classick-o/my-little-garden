import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";

/**
 * Reimprospateaza sesiunea si pazeste rutele.
 *
 * In Next 16 fisierul se numeste `proxy.ts`, nu `middleware.ts`, iar functia
 * exportata se numeste `proxy`. Ghidurile Supabase de pe internet inca spun
 * `middleware` - sunt depasite.
 *
 * Doua treburi, in ordinea asta:
 *
 * 1. **Reimprospatarea.** Componentele server nu pot scrie cookie-uri, deci
 *    jetonul reinnoit nu s-ar salva niciodata de acolo. Aici se poate, si se
 *    intampla inainte de randare.
 * 2. **Paza.** Cine nu e conectat nu ajunge pe ecranele cu date. Nu e singura
 *    aparare - RLS ramane in spate - dar e cea care trimite omul la pagina de
 *    conectare in loc sa-i arate o gradina goala.
 */

/** Rutele care se deschid si fara cont. */
const PUBLIC_PATHS = ["/login", "/auth"];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export async function proxy(request: NextRequest) {
  /* Raspunsul se creeaza inainte de verificare: clientul Supabase scrie
     cookie-urile reinnoite direct in el. */
  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }

        response = NextResponse.next({ request });

        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  /* `getUser`, nu `getSession`: cookie-ul poate fi falsificat, iar `getUser`
     il verifica la Supabase. Apelul asta e si cel care declanseaza
     reimprospatarea. */
  let user = null;

  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    /* Supabase nu raspunde. Nu prabusim fiecare cerere din cauza asta: lasam
       pagina sa incerce si sa arate ea un mesaj omenesc. Nu e o scapare de
       securitate - fara Supabase nu se poate citi oricum niciun rand. */
    return response;
  }

  const { pathname } = request.nextUrl;

  if (!user && !isPublic(pathname)) {
    const login = new URL("/login", request.url);

    /* Ne amintim unde voia sa ajunga, ca dupa conectare sa continue de acolo. */
    if (pathname !== "/") login.searchParams.set("next", pathname);

    return NextResponse.redirect(login);
  }

  /* Conectat si ajuns pe pagina de conectare: nu are ce cauta acolo. */
  if (user && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  /* Tot, mai putin fisierele statice si imaginile. Fara excluderea asta,
     fiecare iconita ar face o verificare de sesiune. */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons/|garden3d/|demo/|manifest.webmanifest|.*\\.(?:png|jpg|jpeg|webp|svg|glb|ico)$).*)",
  ],
};
