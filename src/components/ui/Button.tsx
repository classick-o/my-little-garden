import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

type Variant = "primary" | "soft" | "ghost";
type Size = "md" | "lg" | "icon";

/**
 * Butonul aplicatiei.
 *
 * `primary` e actiunea principala a ecranului - una singura. `soft` e pentru
 * actiunile secundare, pe sticla. `ghost` e pentru cele care nu trebuie sa
 * atraga privirea deloc, ca inchiderea unui card.
 */

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-leaf text-ink-inverse shadow-raised hover:bg-leaf-deep disabled:shadow-none",
  soft: "bg-surface text-ink ring-1 ring-line backdrop-blur-xl hover:bg-surface-strong",
  ghost: "text-ink-muted hover:bg-surface hover:text-ink",
};

const SIZES: Record<Size, string> = {
  md: "h-11 gap-2 px-5 text-[14px]",
  lg: "h-13 gap-2.5 px-6 text-[15px]",
  icon: "size-10",
};

export type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
};

/**
 * Clasele butonului, separat de componenta.
 *
 * Un `Link` catre alt ecran trebuie sa arate la fel ca un buton, dar nu are
 * voie sa fie `<button>` - altfel pierde deschiderea in fila noua si meniul
 * de context.
 */
export function buttonStyle({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
} = {}) {
  return cn(
    "inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold",
    "transition duration-(--duration-quick) ease-(--ease-out-soft)",
    /* Apasarea se simte: butonul cedeaza putin sub deget. */
    "active:scale-[0.97]",
    "disabled:pointer-events-none disabled:opacity-45",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

export function Button({ variant, size, className, ...rest }: ButtonProps) {
  return <button className={buttonStyle({ variant, size, className })} {...rest} />;
}
