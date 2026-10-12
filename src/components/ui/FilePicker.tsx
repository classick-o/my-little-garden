"use client";

import { useId, useState, type ChangeEvent, type Ref } from "react";
import { ImagePlus } from "lucide-react";

import { cn } from "@/lib/cn";

/**
 * Alegerea unui fisier.
 *
 * Campul `<input type="file">` isi deseneaza singur butonul, iar textul lui
 * vine de la browser si e in limba sistemului - "Choose File / No file
 * chosen". Nu se poate traduce si nu se poate stiliza dincolo de buton, deci
 * intr-o aplicatie care trebuie sa fie numai in romana nu are ce cauta.
 *
 * Solutia: campul ramane acolo, fiindca el face treaba si trimite fisierul cu
 * formularul, dar e ascuns vizual. Eticheta de deasupra e butonul pe care il
 * vede ea.
 */
export function FilePicker({
  name,
  ref,
  required,
  label = "Alege o poza",
  onChange,
  className,
}: {
  /* Fara nume, fisierul nu pleaca odata cu formularul. Asa se foloseste cand
     poza e doar sursa pentru altceva - de pilda pentru identificare - si ar fi
     trimisa degeaba, in marimea ei originala. */
  name?: string;
  ref?: Ref<HTMLInputElement>;
  required?: boolean;
  label?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}) {
  const id = useId();
  const [chosen, setChosen] = useState<string | null>(null);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* `sr-only`, nu `display: none`: ascuns de tot, campul nu mai poate fi
          deschis de la tastatura si nici anuntat de cititoarele de ecran. */}
      <input
        id={id}
        ref={ref}
        type="file"
        name={name}
        accept="image/*"
        capture="environment"
        required={required}
        className="sr-only"
        onChange={(event) => {
          setChosen(event.target.files?.[0]?.name ?? null);
          onChange?.(event);
        }}
      />

      <label
        htmlFor={id}
        className={cn(
          "inline-flex h-11 shrink-0 cursor-pointer select-none items-center gap-2 rounded-full px-5",
          "bg-surface text-[14px] font-semibold text-ink ring-1 ring-line",
          "transition duration-(--duration-quick) hover:bg-surface-strong active:scale-[0.97]",
        )}
      >
        <ImagePlus className="size-[18px]" />
        {label}
      </label>

      <span className="min-w-0 truncate text-[13px] text-ink-subtle">
        {chosen ?? "Nicio poza aleasa"}
      </span>
    </div>
  );
}
