"use client";

import { Button } from "@/components/ui/Button";

/**
 * Cand un ecran nu poate fi randat (first-context.md sectiunea 64).
 *
 * Fara fisierul asta, orice cadere - baza de date neraspunzand, de pilda -
 * arata ca o pagina alba cu "500". Aici arata ca o problema trecatoare, cu un
 * buton de reincercare, scris in romana.
 */
export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="glass mt-16 rounded-xl p-7 text-center shadow-card">
      <h1 className="text-xl">Gradina nu poate fi incarcata</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        Nu am reusit sa ajung la datele tale. De obicei trece de la sine.
      </p>

      <Button className="mt-6" onClick={reset}>
        Mai incearca
      </Button>
    </div>
  );
}
