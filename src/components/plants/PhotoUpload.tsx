"use client";

import { useActionState, useRef, useState } from "react";
import { ImagePlus } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { resizeImage } from "@/lib/image";
import { uploadPhotoAction, OK } from "@/app/(app)/plants/actions";

/**
 * Adaugarea unei poze la o planta.
 *
 * Poza se micsoreaza in browser inainte de a pleca (sectiunea 22), deci ce
 * trece prin actiunea server e deja de cateva sute de kilobytes.
 */
export function PhotoUpload({ plantId }: { plantId: string }) {
  const [state, submit, saving] = useActionState(uploadPhotoAction, OK);
  const [prepared, setPrepared] = useState<{ width: number; height: number } | null>(
    null,
  );
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function prepare(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setLocalError(null);

    try {
      const resized = await resizeImage(file);

      /* Inlocuim fisierul ales cu cel micsorat, ca formularul sa-l trimita pe
         al doilea. Altfel ar pleca originalul de cateva megabytes. */
      const transfer = new DataTransfer();
      transfer.items.add(resized.file);
      if (fileInput.current) fileInput.current.files = transfer.files;

      setPrepared({ width: resized.width, height: resized.height });
    } catch {
      setLocalError("Nu am putut citi poza. Incearca alta.");
      setPrepared(null);
    }
  }

  return (
    <form action={submit} className="space-y-3">
      <input type="hidden" name="plantId" value={plantId} />
      <input type="hidden" name="width" value={prepared?.width ?? ""} />
      <input type="hidden" name="height" value={prepared?.height ?? ""} />

      <input
        ref={fileInput}
        type="file"
        name="photo"
        accept="image/*"
        capture="environment"
        required
        onChange={prepare}
        className="block w-full text-[13px] text-ink-muted file:mr-3 file:rounded-full file:border-0 file:bg-surface file:px-4 file:py-2 file:text-[13px] file:text-ink"
      />

      {localError ?? state.error ? (
        <p className="rounded-md bg-wilt-soft px-3 py-2 text-[13px] text-wilt">
          {localError ?? state.error}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="soft"
        disabled={saving || !prepared}
        className="w-full"
      >
        <ImagePlus className="size-[18px]" />
        {saving ? "Se incarca..." : "Adauga poza"}
      </Button>
    </form>
  );
}
