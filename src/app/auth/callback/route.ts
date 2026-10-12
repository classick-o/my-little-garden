import { NextResponse, type NextRequest } from "next/server";

import { supabaseServer } from "@/lib/supabase/server";

/**
 * Intoarcerea de la Google.
 *
 * Google trimite un cod de unica folosinta; aici il schimbam pe o sesiune.
 * Schimbul se face pe server, ca jetoanele sa ajunga in cookie-uri httpOnly
 * si sa nu treaca niciodata prin JavaScript-ul paginii.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    /* Aici ajunge si refuzul listei de acces: declansatorul din baza opreste
       crearea contului, iar schimbul esueaza. Mesajul ramane acelasi pentru
       orice esec - nu spunem unui strain daca adresa lui e sau nu pe lista. */
    return NextResponse.redirect(`${origin}/login?error=exchange_failed`);
  }

  /* Numai cai din aplicatie: altfel parametrul ar putea trimite pe alt site. */
  const target = next.startsWith("/") ? next : "/";
  return NextResponse.redirect(`${origin}${target}`);
}
