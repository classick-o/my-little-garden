/**
 * Inel de progres desenat cu SVG, fara nicio librarie.
 * Folosit de ambele variante de previzualizare.
 */

type ProgressRingProps = {
  label: string;
  value: number;
  total: number;
  /** Culoarea portiunii completate. */
  accent: string;
  /** Culoarea cercului de fundal. Difera intre tema luminoasa si cea intunecata. */
  track: string;
  labelClassName?: string;
  valueClassName?: string;
};

export function ProgressRing({
  label,
  value,
  total,
  accent,
  track,
  labelClassName = "",
  valueClassName = "",
}: ProgressRingProps) {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const filled = circumference * Math.min(value / total, 1);

  return (
    <div className="flex items-center gap-3">
      {/* Rotit ca sa inceapa de sus, nu din dreapta. */}
      <svg viewBox="0 0 40 40" className="size-11 -rotate-90" aria-hidden>
        <circle cx="20" cy="20" r={radius} fill="none" stroke={track} strokeWidth="4" />
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          stroke={accent}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
        />
      </svg>

      <div className="leading-tight">
        <p className={`text-[13px] font-medium ${labelClassName}`}>{label}</p>
        <p className={`text-[12px] ${valueClassName}`}>
          {value} din {total}
        </p>
      </div>
    </div>
  );
}
