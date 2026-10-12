import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { NoteForm } from "@/components/plants/NoteForm";
import { PhotoUpload } from "@/components/plants/PhotoUpload";
import { WaterButton } from "@/components/plants/WaterButton";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Stat } from "@/components/ui/Stat";
import { StatusPill } from "@/components/ui/StatusPill";
import type { Tone } from "@/components/ui/tone";
import { eventLabel, noteText } from "@/lib/events";
import { daysAgoLabel, dueLabel, shortDate } from "@/lib/time";
import type { CareStatus } from "@/lib/watering";
import { listPlantEvents } from "@/repositories/events";
import { listPhotos } from "@/repositories/photos";
import { getPlant } from "@/repositories/plants";

/**
 * Povestea unei plante (first-context.md sectiunea 16).
 *
 * Raspunde intrebarilor din sectiunea 2: cum ii merge, cand am udat-o ultima
 * oara, ce am facut cu ea in ultima vreme.
 */
export const dynamic = "force-dynamic";

/** Culoarea fiecarei stari, aceeasi in pastila si in inel. */
const STATUS_TONE: Record<CareStatus, Tone> = {
  healthy: "leaf",
  needs_water: "water",
  needs_attention: "sun",
};

export async function generateMetadata({ params }: PageProps<"/plants/[id]">) {
  const { id } = await params;
  const plant = await getPlant(id);

  return { title: plant?.name ?? "Planta" };
}

export default async function PlantPage({ params }: PageProps<"/plants/[id]">) {
  /* In Next 16 `params` e asincron. */
  const { id } = await params;

  const plant = await getPlant(id);
  if (!plant) notFound();

  const [photos, events] = await Promise.all([listPhotos(id), listPlantEvents(id)]);

  const cover = photos.find((photo) => photo.id === plant.coverPhotoId) ?? photos[0];
  const tone = STATUS_TONE[plant.status];

  /* Inelul e plin dupa udare si se goleste spre scadenta, ca o baterie. */
  const remaining =
    plant.daysUntilWatering === null
      ? 0
      : Math.max(0, plant.daysUntilWatering) / Math.max(plant.wateringIntervalDays, 1);

  const careAdvice = Object.entries(plant.care).filter(
    (entry): entry is [string, string] => Boolean(entry[1]),
  );

  return (
    <div>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-[13px] text-ink-muted"
      >
        <ArrowLeft className="size-4" />
        Gradina
      </Link>

      {cover?.url ? (
        <div className="relative mt-4 aspect-[4/3] w-full overflow-hidden rounded-xl bg-surface-sunken">
          <Image
            src={cover.url}
            alt={plant.name}
            fill
            sizes="(max-width: 480px) 100vw, 480px"
            className="object-cover"
            priority
          />
        </div>
      ) : null}

      {/* Textul sta sub poza, nu peste ea (CLAUDE.md sectiunea 5). */}
      <header className="mt-4">
        <h1 className="text-[2rem] leading-tight">{plant.name}</h1>
        {plant.species ? (
          <p className="text-sm text-ink-muted">{plant.species}</p>
        ) : null}
        <StatusPill status={plant.status} className="mt-3" />
      </header>

      <section className="glass mt-5 rounded-xl p-4">
        <div className="flex items-center gap-4">
          <div className="flex shrink-0 flex-col items-center gap-1">
            <ProgressRing value={remaining} tone={tone} size={64}>
              {plant.daysUntilWatering !== null && plant.daysUntilWatering > 0 ? (
                <>
                  <span className="text-[18px] font-semibold">
                    {plant.daysUntilWatering}
                  </span>
                  <span className="text-[10px] text-ink-subtle">
                    {plant.daysUntilWatering === 1 ? "zi" : "zile"}
                  </span>
                </>
              ) : (
                <span className="text-[13px] font-semibold">acum</span>
              )}
            </ProgressRing>
            <span className="text-[10px] uppercase tracking-wide text-ink-subtle">
              Udare
            </span>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Stat
              label="Udata"
              value={daysAgoLabel(plant.daysSinceWatering)}
              tone="water"
            />
            <Stat label="Impreuna" value={`${plant.daysOwned} zile`} tone="leaf" />
          </div>
        </div>

        <p className="mt-3 text-[13px] text-ink-muted">
          Se uda la {plant.wateringIntervalDays} zile. Urmatoarea{" "}
          {dueLabel(plant.daysUntilWatering)}.
        </p>

        <WaterButton
          plantId={plant.id}
          wateredToday={plant.daysSinceWatering === 0}
          size="lg"
          className="mt-4"
        />
      </section>

      {plant.location ? (
        <p className="mt-4 text-[13px] text-ink-muted">Sta {plant.location}.</p>
      ) : null}

      {careAdvice.length > 0 ? (
        <section className="mt-6">
          <h2 className="text-[13px] uppercase tracking-wide text-ink-subtle">
            Cum sa ai grija de ea
          </h2>
          <dl className="glass mt-3 space-y-3 rounded-xl p-4">
            {careAdvice.map(([key, value]) => (
              <div key={key}>
                <dt className="text-[12px] uppercase tracking-wide text-ink-subtle">
                  {CARE_LABELS[key] ?? key}
                </dt>
                <dd className="mt-0.5 text-[14px] leading-relaxed">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <section className="mt-6">
        <h2 className="text-[13px] uppercase tracking-wide text-ink-subtle">Poze</h2>

        {photos.length > 0 ? (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {photos.map((photo) =>
              photo.url ? (
                <div
                  key={photo.id}
                  className="relative aspect-square overflow-hidden rounded-md bg-surface-sunken"
                >
                  <Image
                    src={photo.url}
                    alt=""
                    fill
                    sizes="33vw"
                    className="object-cover"
                  />
                </div>
              ) : null,
            )}
          </div>
        ) : (
          <p className="mt-3 text-[13px] text-ink-muted">
            Nicio poza inca. Prima e si inceputul povestii ei.
          </p>
        )}

        <div className="mt-4">
          <PhotoUpload plantId={plant.id} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-[13px] uppercase tracking-wide text-ink-subtle">
          Insemnare noua
        </h2>
        <div className="mt-3">
          <NoteForm plantId={plant.id} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-[13px] uppercase tracking-wide text-ink-subtle">
          Ce s-a intamplat
        </h2>

        {events.length === 0 ? (
          <p className="mt-3 text-[13px] text-ink-muted">Inca nimic de povestit.</p>
        ) : (
          <ol className="mt-3 space-y-3">
            {events.map((event) => (
              <li key={event.id} className="glass rounded-md px-4 py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[14px]">{eventLabel(event.type)}</span>
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
      </section>
    </div>
  );
}

const CARE_LABELS: Record<string, string> = {
  light: "Lumina",
  watering: "Apa",
  humidity: "Umiditate",
  temperature: "Temperatura",
};
