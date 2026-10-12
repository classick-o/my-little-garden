"use client";

import { useActionState, useRef, useState } from "react";
import Image from "next/image";
import { Camera, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { resizeImage } from "@/lib/image";
import { addPlantAction, OK } from "../actions";
import type { PlantIdentification } from "@/services/ai";

/**
 * Adaugarea unei plante.
 *
 * Un singur formular pentru ambele cai din sectiunea 44: completare manuala si
 * ajutor de la asistent. Identificarea nu inlocuieste formularul, ci il
 * precompleteaza - ea ramane cea care decide, si poate schimba orice camp
 * inainte de a salva.
 */

const SUNLIGHT_OPTIONS = [
  { value: "low", label: "Lumina putina" },
  { value: "medium", label: "Lumina medie" },
  { value: "bright_indirect", label: "Lumina multa, indirecta" },
  { value: "direct", label: "Soare direct" },
] as const;

type Identified = {
  result: PlantIdentification;
  /* Pastrat ca sa il trimitem odata cu planta, fara sa-l recitim. */
  careJson: string;
};

export function NewPlantForm() {
  const [state, submit, saving] = useActionState(addPlantAction, OK);

  const [preview, setPreview] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [identifying, setIdentifying] = useState(false);
  const [identified, setIdentified] = useState<Identified | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);
  const speciesRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<HTMLInputElement>(null);
  const sunlightRef = useRef<HTMLSelectElement>(null);

  async function pickPhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setAiError(null);
    setIdentified(null);

    try {
      const resized = await resizeImage(file);
      setPhoto(resized.file);

      /* Adresa veche se elibereaza, altfel fiecare poza aleasa lasa in urma
         un obiect care nu mai e eliberat niciodata. */
      setPreview((old) => {
        if (old) URL.revokeObjectURL(old);
        return URL.createObjectURL(resized.file);
      });
    } catch {
      setAiError("Nu am putut citi poza. Incearca alta.");
    }
  }

  async function identify() {
    if (!photo) return;

    setIdentifying(true);
    setAiError(null);

    try {
      const body = new FormData();
      body.append("photo", photo);

      const response = await fetch("/api/identify", { method: "POST", body });
      const payload = await response.json();

      if (!response.ok) {
        setAiError(payload.error ?? "Nu am reusit sa recunosc planta.");
        return;
      }

      const result = payload.data as PlantIdentification;

      if (!result.is_plant) {
        setAiError("Nu pare sa fie o planta in poza. Incearca alta.");
        return;
      }

      setIdentified({ result, careJson: JSON.stringify(result.care) });

      /* Precompletam, fara sa stergem ce a scris deja ea. */
      if (nameRef.current && !nameRef.current.value) {
        nameRef.current.value = result.common_name;
      }
      if (speciesRef.current) speciesRef.current.value = result.scientific_name;
      if (intervalRef.current) {
        intervalRef.current.value = String(result.suggested_watering_interval_days);
      }
      if (sunlightRef.current) sunlightRef.current.value = result.suggested_sunlight;
    } catch {
      setAiError("Nu am putut vorbi cu asistentul. Verifica legatura la internet.");
    } finally {
      setIdentifying(false);
    }
  }

  return (
    <form action={submit} className="mt-6 space-y-5">
      {/* --- Poza si identificarea ------------------------------------- */}
      <section className="glass rounded-xl p-4">
        <label className="block">
          <span className="text-[13px] text-ink-muted">Poza plantei</span>

          <div className="mt-2 flex items-center gap-3">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-surface-sunken">
              {preview ? (
                <Image src={preview} alt="" fill unoptimized className="object-cover" />
              ) : (
                <span className="flex h-full items-center justify-center text-ink-subtle">
                  <Camera className="size-6" strokeWidth={1.5} />
                </span>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={pickPhoto}
              className="block w-full text-[13px] text-ink-muted file:mr-3 file:rounded-full file:border-0 file:bg-surface file:px-4 file:py-2 file:text-[13px] file:text-ink"
            />
          </div>
        </label>

        <Button
          type="button"
          variant="soft"
          className="mt-3 w-full"
          disabled={!photo || identifying}
          onClick={identify}
        >
          <Sparkles className="size-[18px]" />
          {identifying ? "Ma uit la poza..." : "Recunoaste planta"}
        </Button>

        {aiError ? (
          <p className="mt-3 rounded-md bg-wilt-soft px-3 py-2 text-[13px] text-wilt">
            {aiError}
          </p>
        ) : null}

        {identified ? <Identification identified={identified} /> : null}
      </section>

      {/* --- Datele plantei --------------------------------------------- */}
      <section className="glass space-y-4 rounded-xl p-4">
        <Field label="Cum o cheama" hint="Numele ei, nu specia.">
          <input
            ref={nameRef}
            name="name"
            required
            maxLength={60}
            placeholder="Luna"
            className={inputClass}
          />
        </Field>

        <Field label="Specia" hint="Optional. Asistentul o poate completa.">
          <input
            ref={speciesRef}
            name="species"
            maxLength={120}
            placeholder="Monstera deliciosa"
            className={inputClass}
          />
        </Field>

        <Field label="Unde sta">
          <input
            name="location"
            maxLength={80}
            placeholder="Langa fereastra din living"
            className={inputClass}
          />
        </Field>

        <Field label="Lumina">
          <select ref={sunlightRef} name="sunlight" defaultValue="" className={inputClass}>
            <option value="">Nu stiu inca</option>
            {SUNLIGHT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="La cate zile se uda">
          <input
            ref={intervalRef}
            name="wateringIntervalDays"
            type="number"
            inputMode="numeric"
            min={1}
            max={365}
            defaultValue={7}
            required
            className={inputClass}
          />
        </Field>

        <label className="flex items-center gap-3 text-[14px]">
          <input
            type="checkbox"
            name="wateredNow"
            value="true"
            className="size-5 accent-leaf"
          />
          Am udat-o chiar acum
        </label>
      </section>

      {/* Sfaturile de la asistent calatoresc cu formularul, ca sa ajunga in
          `plants.care` fara inca o cerere. */}
      <input type="hidden" name="care" value={identified?.careJson ?? ""} />

      {state.error ? (
        <p className="rounded-md bg-wilt-soft px-4 py-3 text-[13px] text-wilt">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={saving}>
        {saving ? "Se salveaza..." : "Adauga in gradina"}
      </Button>
    </form>
  );
}

const inputClass =
  "mt-1.5 h-12 w-full rounded-md border border-line bg-surface-sunken px-3 text-[15px] text-ink placeholder:text-ink-subtle focus:border-line-strong focus:outline-none";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[13px] text-ink-muted">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-[12px] text-ink-subtle">{hint}</span> : null}
    </label>
  );
}

/**
 * Ce a gasit asistentul.
 *
 * Increderea se arata intotdeauna (sectiunea 26): un raspuns nesigur prezentat
 * ca sigur e mai rau decat niciun raspuns.
 */
function Identification({ identified }: { identified: Identified }) {
  const { result } = identified;
  const percent = Math.round(result.confidence * 100);

  return (
    <div className="mt-3 rounded-md bg-leaf-soft p-3">
      <p className="text-[14px] font-semibold text-leaf">
        {result.common_name}
        <span className="ml-2 font-normal text-ink-muted">
          {percent}% incredere
        </span>
      </p>
      <p className="text-[12px] text-ink-muted">{result.scientific_name}</p>

      {percent < 60 ? (
        <p className="mt-2 text-[12px] text-ink-muted">
          Nu sunt foarte sigur. Verifica si schimba ce nu e bine.
        </p>
      ) : null}

      <ul className="mt-2 space-y-1">
        {result.interesting_facts.map((fact) => (
          <li key={fact} className="text-[12px] leading-relaxed text-ink-muted">
            {fact}
          </li>
        ))}
      </ul>
    </div>
  );
}
