"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { supabaseBrowser } from "@/lib/supabase/client";

/**
 * Butonul de conectare.
 *
 * Trebuie sa fie in browser: Supabase duce utilizatorul la Google si il aduce
 * inapoi, iar asta porneste dintr-o navigare, nu de pe server.
 */
export function GoogleSignIn({ next }: { next: string }) {
  const [busy, setBusy] = useState(false);

  async function signIn() {
    setBusy(true);

    const supabase = supabaseBrowser();
    const callback = new URL("/auth/callback", window.location.origin);
    callback.searchParams.set("next", next);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callback.toString() },
    });

    /* Daca pornirea esueaza, pagina ramane aici si trebuie sa spunem de ce.
       Cand reuseste, browserul pleaca si starea asta nu mai conteaza. */
    if (error) setBusy(false);
  }

  return (
    <Button size="lg" className="mt-6 w-full" disabled={busy} onClick={signIn}>
      {busy ? "Se deschide Google..." : "Continua cu Google"}
    </Button>
  );
}
