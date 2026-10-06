import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { TONE_STROKE, type Tone } from "./tone";

/**
 * Inel de progres.
 *
 * Arata cat a mai ramas dintr-un interval - de obicei pana la urmatoarea
 * udare. Un numar singur nu spune nimic: "3 zile" e mult sau putin numai
 * raportat la cat tine intervalul.
 */
export function ProgressRing({
  value,
  tone = "leaf",
  size = 60,
  children,
  className,
}: {
  /** Intre 0 si 1. Valorile din afara se taie. */
  value: number;
  tone?: Tone;
  size?: number;
  children?: ReactNode;
  className?: string;
}) {
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = Math.min(Math.max(value, 0), 1);

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      {/* Rotit cu un sfert, ca inelul sa porneasca de sus, nu din dreapta. */}
      <svg viewBox={`0 0 ${size} ${size}`} className="size-full -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-white/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - filled)}
          className={cn(
            "transition-[stroke-dashoffset] duration-(--duration-slow) ease-(--ease-out-soft)",
            TONE_STROKE[tone],
          )}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        {children}
      </div>
    </div>
  );
}
