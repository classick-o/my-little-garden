import { NextResponse, type NextRequest } from "next/server";

import { supabaseServer } from "@/lib/supabase/server";

/**
 * Deconectarea.
 *
 * Ruta accepta doar POST: un GET ar putea fi declansat de o imagine sau de o
 * precitire a browserului, si s-ar deconecta singura.
 */
export async function POST(request: NextRequest) {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();

  return NextResponse.redirect(new URL("/login", request.url), {
    /* 303 ca browserul sa treaca pe GET dupa POST. */
    status: 303,
  });
}
