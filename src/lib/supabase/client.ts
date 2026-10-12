"use client";

import { createBrowserClient } from "@supabase/ssr";

import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";
import type { Database } from "./database";

/**
 * Clientul Supabase pentru browser.
 *
 * Primeste doar cheia publica - singura care are voie sa ajunga aici. Datele
 * sunt protejate de RLS, nu de secretul cheii.
 *
 * Il folosim strict pentru lucruri care trebuie sa se intample in browser:
 * incarcarea pozelor si deconectarea. Citirile si scrierile de date trec prin
 * actiuni server, ca sa ramana un singur loc unde se verifica regulile.
 */
export function supabaseBrowser() {
  return createBrowserClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
  );
}
