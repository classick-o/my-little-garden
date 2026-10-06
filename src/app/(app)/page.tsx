import Link from "next/link";
import { Leaf, Trees } from "lucide-react";
import { buttonStyle } from "@/components/ui/Button";
import { greeting } from "@/lib/time";

/* Salutul depinde de ora, deci pagina nu poate fi prerandata.
   Odata cu autentificarea devine oricum dinamica. */
export const dynamic = "force-dynamic";

export default function GardenPage() {
  return (
    <div>
      <header>
        <p className="text-sm text-ink-muted">{greeting()} &#127807;</p>
        <h1 className="mt-1 text-[2.1rem]">Gradina ta mica</h1>
      </header>

      {/* Stare goala (first-context.md sectiunea 48). Va fi inlocuita de
          lista de plante odata ce exista baza de date. */}
      <section className="glass mt-10 rounded-xl p-8 text-center shadow-card">
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
          className={buttonStyle({ size: "lg", className: "mt-6" })}
        >
          Adauga prima planta
        </Link>

        {/* Gradina 3D e o a doua privire asupra acelorasi plante, nu alt loc
            unde se adauga ceva. De asta e actiune secundara. */}
        <Link
          href="/garden"
          className={buttonStyle({ variant: "soft", className: "mt-3 w-full" })}
        >
          <Trees className="size-[18px]" />
          Vezi gradina in 3D
        </Link>
      </section>
    </div>
  );
}
