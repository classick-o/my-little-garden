import Link from "next/link";
import Image from "next/image";
import { Leaf } from "lucide-react";

import { StatusPill } from "@/components/ui/StatusPill";
import { dueLabel } from "@/lib/time";
import type { Plant } from "@/repositories/plants";

import { WaterButton } from "./WaterButton";

/**
 * Planta pe ecranul Gradina.
 *
 * Poza sta sus, textul sub ea - nu peste. Pe fundal inchis, text alb peste o
 * fotografie ar cere un val intunecat peste poza, iar asta strica tocmai poza
 * (CLAUDE.md sectiunea 5).
 */
export function PlantCard({
  plant,
  coverUrl,
}: {
  plant: Plant;
  coverUrl: string | null;
}) {
  const wateredToday = plant.daysSinceWatering === 0;

  return (
    <article className="glass overflow-hidden rounded-xl shadow-card">
      <Link href={`/plants/${plant.id}`} className="block">
        <div className="relative aspect-[4/3] w-full bg-surface-sunken">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={plant.name}
              fill
              sizes="(max-width: 480px) 100vw, 480px"
              className="object-cover"
            />
          ) : (
            <span className="flex h-full items-center justify-center text-ink-subtle">
              <Leaf className="size-9" strokeWidth={1.4} />
            </span>
          )}
        </div>

        <div className="p-4">
          <h2 className="truncate text-[1.35rem] leading-tight">{plant.name}</h2>
          {plant.species ? (
            <p className="truncate text-[13px] text-ink-muted">{plant.species}</p>
          ) : null}

          <div className="mt-3 flex items-center justify-between gap-2">
            <StatusPill status={plant.status} />
            <span className="shrink-0 text-[12px] text-ink-subtle">
              apa {dueLabel(plant.daysUntilWatering)}
            </span>
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4">
        <WaterButton plantId={plant.id} wateredToday={wateredToday} />
      </div>
    </article>
  );
}
