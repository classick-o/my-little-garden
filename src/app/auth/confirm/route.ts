import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { supabaseServer } from "@/lib/supabase/server";

/**
 * Intrarea pe baza unui jeton trimis de Supabase.
 *
 * Tiparul standard pentru legaturi magice si confirmari de email. Nu e o usa
 * din dos: jetonul e emis de Supabase, e de unica folosinta si expira. Cine il
 * are e deja autorizat - ruta doar il preschimba in sesiune, pe server, ca
 * jetoanele sa ajunga in cookie-uri httpOnly.
 *
 * Local, `npm run dev:login` genereaza un astfel de jeton si ne lasa sa
 * verificam toate fluxurile fara clientul Google OAuth, care inca nu exista.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  if (!tokenHash || !type) {
    return NextResponse.redirect(`${origin}/login?error=missing_token`);
  }

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=verify_failed`);
  }

  const target = next.startsWith("/") ? next : "/";
  return NextResponse.redirect(`${origin}${target}`);
}
