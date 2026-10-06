import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { TONE_SOFT, type Tone } from "./tone";

/**
 * O cifra cu eticheta ei.
 *
 * Eticheta sta deasupra si e mica: valoarea e ce se citeste primul, eticheta
 * doar spune ce inseamna.
 */
export function Stat({
  label,
  value,
  icon,
  tone = "leaf",
  className,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 items-center gap-2.5 rounded-md bg-surface-sunken px-3 py-2.5",
        className,
      )}
    >
      {icon ? (
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full",
            TONE_SOFT[tone],
          )}
        >
          {icon}
        </span>
      ) : null}

      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-ink-subtle">{label}</p>
        <p className="truncate text-[13px] font-semibold">{value}</p>
      </div>
    </div>
  );
}
