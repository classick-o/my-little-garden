import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * PREVIZUALIZARE - nu face parte din aplicatie.
 *
 * Punctul de intrare pentru compararea celor doua directii vizuale.
 * Pe telefon: doua legaturi. Pe ecran mare: ambele variante, una langa alta.
 *
 * Tot folderul preview dispare dupa ce se alege o directie.
 */

export const metadata = { title: "Doua directii vizuale" };

const VARIANTS = [
  {
    href: "/preview/light",
    name: "Luminos",
    summary: "Crem cald, verde retinut, poza pe alb",
    detail:
      "Directia din documentul initial. Fotografia isi pastreaza lumina, fiindca textul sta sub ea, nu peste.",
  },
  {
    href: "/preview/dark",
    name: "Intunecat",
    summary: "Verde inchis, carduri de sticla, verde viu",
    detail:
      "Directia din imaginea de referinta. Arata spectaculos, dar fiecare poza are nevoie de un val intunecat ca textul alb sa ramana lizibil.",
  },
] as const;

export default function PreviewIndexPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-[2rem]">Doua directii vizuale</h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
        Acelasi ecran si acelasi continut, in doua limbaje vizuale. Deschide-le pe
        telefon si compara-le; in fiecare ai jos un comutator ca sa sari direct de la
        una la alta.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {VARIANTS.map((variant) => (
          <Link
            key={variant.href}
            href={variant.href}
            className="group rounded-2xl bg-surface p-6 shadow-card ring-1 ring-line transition-shadow duration-200 hover:shadow-raised"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl">{variant.name}</h2>
              <ArrowRight className="size-5 text-ink-subtle transition-transform duration-200 group-hover:translate-x-1" />
            </div>
            <p className="mt-1 text-[13px] text-ink-subtle">{variant.summary}</p>
            <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">
              {variant.detail}
            </p>
          </Link>
        ))}
      </div>

      {/* Comparatia directa are sens doar cand incap amandoua pe ecran. */}
      <section className="mt-12 hidden lg:block">
        <h2 className="text-xl">Una langa alta</h2>
        <p className="mt-1 text-[14px] text-ink-muted">
          Ambele la latimea unui iPhone.
        </p>

        <div className="mt-6 flex gap-8">
          {VARIANTS.map((variant) => (
            <figure key={variant.href}>
              <div className="overflow-hidden rounded-[2.25rem] bg-black p-2 shadow-float">
                <iframe
                  src={variant.href}
                  title={`Varianta ${variant.name}`}
                  width={390}
                  height={780}
                  className="rounded-[1.75rem] bg-canvas"
                />
              </div>
              <figcaption className="mt-3 text-center text-[13px] text-ink-muted">
                {variant.name}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </main>
  );
}
