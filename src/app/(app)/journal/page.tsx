import Link from "next/link";
import { NotebookPen } from "lucide-react";

import { NoteForm } from "@/components/plants/NoteForm";
import { eventLabel, noteText } from "@/lib/events";
import { shortDate } from "@/lib/time";
import { listJournal } from "@/repositories/events";

/**
 * Jurnalul (first-context.md sectiunea 20).
 *
 * Tot ce s-a intamplat in gradina, in ordinea in care s-a intamplat. Nu e un
 * tabel de evenimente, e arhiva vie din sectiunea 78 - de aceea fiecare rand
 * spune cu ce planta are de-a face, si duce la ea.
 */
export const dynamic = "force-dynamic";

export const metadata = { title: "Jurnal" };

export default async function JournalPage() {
  const events = await listJournal();

  return (
    <div>
      <header>
        <h1 className="text-[2.1rem]">Jurnal</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Tot ce s-a intamplat in gradina ta.
        </p>
      </header>

      <section className="glass mt-6 rounded-xl p-4">
        <h2 className="text-[13px] uppercase tracking-wide text-ink-subtle">
          Scrie ceva
        </h2>
        <div className="mt-3">
          {/* Fara planta: o insemnare despre gradina intreaga. */}
          <NoteForm plantId={null} />
        </div>
      </section>

      {events.length === 0 ? (
        <section className="glass mt-6 rounded-xl p-8 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-leaf-soft text-leaf">
            <NotebookPen className="size-7" strokeWidth={1.7} />
          </span>
          <h2 className="mt-5 text-xl">Jurnalul e gol deocamdata</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Se umple singur pe masura ce uzi, fotografiezi si notezi.
          </p>
        </section>
      ) : (
        <ol className="mt-6 space-y-3">
          {events.map((event) => (
            <li key={event.id} className="glass rounded-md px-4 py-3">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[14px]">
                  {event.plantName ? (
                    event.plantId ? (
                      <Link
                        href={`/plants/${event.plantId}`}
                        className="font-semibold text-leaf"
                      >
                        {event.plantName}
                      </Link>
                    ) : (
                      <span className="font-semibold">{event.plantName}</span>
                    )
                  ) : (
                    <span className="font-semibold">Gradina</span>
                  )}{" "}
                  <span className="text-ink-muted">{eventLabel(event.type)}</span>
                </p>

                <span className="shrink-0 text-[12px] text-ink-subtle">
                  {shortDate(event.createdAt)}
                </span>
              </div>

              {noteText(event.metadata) ? (
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
                  {noteText(event.metadata)}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
