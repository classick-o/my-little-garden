"use client";

import { Component, type ReactNode } from "react";

/**
 * Paznicul scenei 3D.
 *
 * Fara el, orice problema - un shader care nu compileaza, memorie
 * insuficienta, un model stricat - inseamna ecran gol si nicio informatie. Pe
 * telefon, unde nu poti deschide consola, asta e imposibil de depanat.
 *
 * Cazul "browserul nu stie WebGL" e tratat separat, de proprietatea `fallback`
 * a lui Canvas: acolo nu se arunca nicio eroare, pur si simplu nu se randeaza
 * nimic, deci o granita de erori nu l-ar prinde.
 */
export class CanvasGuard extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <SceneMessage
          title="Gradina s-a oprit"
          detail={this.state.error.message || "Eroare necunoscuta."}
        />
      );
    }

    return this.props.children;
  }
}

/** Mesajul afisat cand scena nu poate porni sau s-a oprit. */
export function SceneMessage({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex h-dvh w-full items-center justify-center p-8">
      <div className="glass max-w-sm rounded-2xl p-6 text-center shadow-card">
        <h2 className="text-xl">{title}</h2>
        <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">{detail}</p>
      </div>
    </div>
  );
}
