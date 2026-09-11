import Link from "next/link";
import { Leaf } from "lucide-react";
import { greeting } from "@/lib/time";

/* Salutul depinde de ora, deci pagina nu poate fi prerandata.
   Odata cu autentificarea devine oricum dinamica. */
export const dynamic = "force-dynamic";

export default function GardenPage() {
  return (
    <div>
      <header>
        <p className="text-sm text-ink-muted">{greeting()} &#127807;</p>
        <h1 className="mt-1 text-[2rem]">Gradina ta mica</h1>
      </header>

      {/* Stare goala (first-context.md sectiunea 48). Va fi inlocuita de
          lista de plante odata ce exista baza de date. */}
      <section className="mt-10 rounded-2xl border border-line bg-surface p-8 text-center shadow-card">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-leaf-soft text-leaf">
          <Leaf className="size-7" strokeWidth={1.7} />
        </span>

        <h2 className="mt-5 text-xl">Gradina ta te asteapta</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          Incepe cu prima ta planta. Ii dai un nume, ii faci o poza si de acolo
          crestem impreuna.
        </p>

        <Link
          href="/plants/new"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-leaf px-6 text-sm font-medium text-ink-inverse transition-colors duration-(--duration-quick) hover:bg-leaf-deep active:scale-[0.98]"
        >
          Adauga prima planta
        </Link>
      </section>
    </div>
  );
}
