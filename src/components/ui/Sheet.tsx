"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * Cardul care urca de jos.
 *
 * Pe telefon, un dialog centrat cade departe de degetul mare. De jos vine
 * exact unde sta mana, si se inchide tragandu-l in jos - gestul pe care il
 * incearca oricine inainte sa caute butonul de inchidere.
 */

/** Cat trebuie tras in jos ca sa se inchida. Mai putin inseamna ca se intoarce. */
const DISMISS_DISTANCE = 90;

export function Sheet({
  open,
  onClose,
  label,
  over = false,
  scrim = true,
  children,
}: {
  open: boolean;
  onClose: () => void;
  /** Ce anume arata cardul, pentru cititoarele de ecran. */
  label: string;
  /** Asezat peste ceva luminos - o poza sau scena 3D - nu peste fundalul aplicatiei. */
  over?: boolean;
  /** Valul din spate. Se scoate cand scena de dedesubt se intuneca singura. */
  scrim?: boolean;
  children: ReactNode;
}) {
  /* Cat de jos a fost tras cardul acum. */
  const [pulled, setPulled] = useState(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  /* De unde a plecat degetul pe maner. */
  const startY = useRef(0);

  const startPull = useCallback((event: PointerEvent<HTMLDivElement>) => {
    /* Prindem degetul pe element: altfel, iesind de pe maner, tragerea se
       pierde la jumatate si cardul ramane atarnat. */
    event.currentTarget.setPointerCapture(event.pointerId);
    startY.current = event.clientY;
    setDragging(true);
  }, []);

  const pull = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!dragging) return;

      /* Numai in jos. In sus cardul nu are unde sa mearga. */
      setPulled(Math.max(0, event.clientY - startY.current));
    },
    [dragging],
  );

  const endPull = useCallback(() => {
    if (!dragging) return;

    setDragging(false);

    /* Inchiderea si revenirea la zero merg impreuna: cardul trebuie sa fie sus
       data viitoare cand se deschide, nu de unde a fost tras acum. */
    if (pulled > DISMISS_DISTANCE) onClose();
    setPulled(0);
  }, [dragging, pulled, onClose]);

  return (
    <>
      {scrim ? (
        <button
          aria-hidden={!open}
          tabIndex={-1}
          onClick={onClose}
          className={cn(
            "fixed inset-0 z-20 bg-canvas-deep/55 backdrop-blur-[2px]",
            "transition-opacity duration-(--duration-base)",
            open ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        />
      ) : null}

      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        aria-hidden={!open}
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 p-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
        style={{
          transform: `translateY(${open ? pulled : 48}px)`,
          opacity: open ? 1 : 0,
          /* In timpul tragerii cardul urmeaza degetul direct: orice tranzitie
             aici l-ar face sa ramana in urma. */
          transition: dragging
            ? "none"
            : "transform var(--duration-slow) var(--ease-out-soft), opacity var(--duration-base) var(--ease-out-soft)",
        }}
      >
        <div
          className={cn(
            "content-width overflow-hidden rounded-2xl shadow-float",
            over ? "glass-over" : "glass",
          )}
        >
          {/* Manerul. Zona de prindere e mai inalta decat dunga care se vede. */}
          <div
            onPointerDown={startPull}
            onPointerMove={pull}
            onPointerUp={endPull}
            onPointerCancel={endPull}
            className="flex cursor-grab touch-none justify-center pt-2.5 pb-1 active:cursor-grabbing"
          >
            <span className="h-1 w-10 rounded-full bg-line-strong" />
          </div>

          {children}
        </div>
      </div>
    </>
  );
}
