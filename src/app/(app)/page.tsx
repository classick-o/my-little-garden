import Link from "next/link";
import { Leaf, Trees } from "lucide-react";

import { PlantCard } from "@/components/plants/PlantCard";
import { buttonStyle } from "@/components/ui/Button";
import { coverUrls } from "@/repositories/photos";
import { listPlants } from "@/repositories/plants";
import { greeting } from "@/lib/time";

/* Salutul depinde de ora, iar plantele de cine e conectat. Pagina nu poate fi
   prerandata. */
export const dynamic = "force-dynamic";

export default async function GardenPage() {
  const plants = await listPlants();
  const covers = await coverUrls(plants.map((plant) => plant.coverPhotoId));

  /* Intrebarea la care raspunde ecranul: ce se intampla azi in gradina mea?
     (first-context.md sectiunea 2). Deci ce are nevoie de apa, intai. */
  const thirsty = plants.filter((plant) => plant.status !== "healthy");
  const fine = plants.filter((plant) => plant.status === "healthy");

  return (
    <div>
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-ink-muted">{greeting()} &#127807;</p>
          <h1 className="mt-1 text-[2.1rem]">Gradina ta mica</h1>
        </div>

        {/* POST, nu legatura: un GET ar putea fi declansat de o precitire a
            browserului si s-ar deconecta singura. */}
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="shrink-0 pt-1 text-[12px] text-ink-subtle transition-colors hover:text-ink-muted"
          >
            Iesi
          </button>
        </form>
      </header>

      {plants.length === 0 ? (
        <EmptyGarden />
      ) : (
        <div className="mt-8 space-y-8">
          {thirsty.length > 0 ? (
            <Section
              title="Au nevoie de tine"
              plants={thirsty}
              covers={covers}
            />
          ) : (
            <p className="glass rounded-xl p-4 text-[13px] text-ink-muted">
              Toate plantele sunt in regula astazi. Nu trebuie sa faci nimic.
            </p>
          )}

          {fine.length > 0 ? (
            <Section title="Restul gradinii" plants={fine} covers={covers} />
          ) : null}

          <Link href="/garden" className={buttonStyle({ variant: "soft", className: "w-full" })}>
            <Trees className="size-[18px]" />
            Vezi gradina in 3D
          </Link>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  plants,
  covers,
}: {
  title: string;
  plants: Awaited<ReturnType<typeof listPlants>>;
  covers: Map<string, string>;
}) {
  return (
    <section>
      <h2 className="text-[13px] uppercase tracking-wide text-ink-subtle">{title}</h2>

      <div className="mt-3 space-y-4">
        {plants.map((plant) => (
          <PlantCard
            key={plant.id}
            plant={plant}
            coverUrl={plant.coverPhotoId ? (covers.get(plant.coverPhotoId) ?? null) : null}
          />
        ))}
      </div>
    </section>
  );
}

/** Starea goala (first-context.md sectiunea 48). */
function EmptyGarden() {
  return (
    <section className="glass mt-10 rounded-xl p-8 text-center shadow-card">
      <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-leaf-soft text-leaf">
        <Leaf className="size-7" strokeWidth={1.7} />
      </span>

      <h2 className="mt-5 text-xl">Gradina ta te asteapta</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        Incepe cu prima ta planta. Ii dai un nume, ii faci o poza si de acolo
        crestem impreuna.
      </p>

      <Link href="/plants/new" className={buttonStyle({ size: "lg", className: "mt-6" })}>
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
  );
}
