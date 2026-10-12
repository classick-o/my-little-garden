"use client";

import { useActionState, useEffect, useRef } from "react";

import { Button } from "@/components/ui/Button";
import { addNoteAction } from "@/app/(app)/plants/actions";
import { OK } from "@/app/(app)/plants/action-state";

/**
 * Scrierea unei insemnari.
 *
 * Insemnarile stau in `plant_events`, nu intr-un tabel propriu: sectiunea 19
 * cere o singura istorie, si asa jurnalul le arata amestecate cu udarile si
 * pozele, in ordinea in care s-au intamplat.
 */
export function NoteForm({ plantId }: { plantId: string | null }) {
  const [state, submit, saving] = useActionState(addNoteAction, OK);
  const form = useRef<HTMLFormElement>(null);

  /* Dupa o salvare reusita golim campul, ca sa nu para ca nu s-a trimis. */
  useEffect(() => {
    if (!saving && !state.error) form.current?.reset();
  }, [saving, state]);

  return (
    <form ref={form} action={submit} className="space-y-3">
      {plantId ? <input type="hidden" name="plantId" value={plantId} /> : null}

      <textarea
        name="text"
        rows={3}
        maxLength={2000}
        required
        placeholder="Ce ai observat azi?"
        className="w-full rounded-md border border-line bg-surface-sunken p-3 text-[15px] text-ink placeholder:text-ink-subtle focus:border-line-strong focus:outline-none"
      />

      {state.error ? (
        <p className="rounded-md bg-wilt-soft px-3 py-2 text-[13px] text-wilt">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" variant="soft" disabled={saving} className="w-full">
        {saving ? "Se salveaza..." : "Adauga insemnarea"}
      </Button>
    </form>
  );
}
