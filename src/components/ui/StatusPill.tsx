import { Droplet, Leaf, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import type { CareStatus } from "@/lib/watering";
import { TONE_SOFT, type Tone } from "./tone";

/**
 * Starea plantei, intr-o pastila.
 *
 * Culoarea singura nu ajunge - cine nu distinge verdele de galben nu ar afla
 * nimic. De asta fiecare stare are si iconita, si text (sectiunea 82).
 */

const STATUS: Record<CareStatus, { label: string; tone: Tone; icon: ReactNode }> = {
  healthy: { label: "Se simte bine", tone: "leaf", icon: <Leaf className="size-3.5" /> },
  needs_water: {
    label: "Are nevoie de apa",
    tone: "water",
    icon: <Droplet className="size-3.5" />,
  },
  needs_attention: {
    label: "Are nevoie de atentie",
    tone: "sun",
    icon: <TriangleAlert className="size-3.5" />,
  },
};

export function StatusPill({
  status,
  className,
}: {
  status: CareStatus;
  className?: string;
}) {
  const { label, tone, icon } = STATUS[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold",
        TONE_SOFT[tone],
        className,
      )}
    >
      {icon}
      {label}
    </span>
  );
}
