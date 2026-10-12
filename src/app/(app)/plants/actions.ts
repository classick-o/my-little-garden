"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { OK, type ActionState } from "./action-state";

import { SUNLIGHT_LEVELS } from "@/services/ai/schemas";
import { addNote } from "@/repositories/events";
import { uploadPhoto } from "@/repositories/photos";
import {
  createPlant,
  deletePlant,
  updatePlant,
  waterPlant,
} from "@/repositories/plants";

/**
 * Actiunile asupra plantelor.
 *
 * Aici se opresc datele venite din formulare: se valideaza, apoi se trimit mai
 * departe la depozit. Componentele nu cheama niciodata depozitul direct.
 *
 * Fiecare actiune intoarce o stare, nu arunca: formularul trebuie sa poata
 * arata mesajul fara sa prabuseasca ecranul.
 */

const plantFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Da-i un nume.")
    .max(60, "Numele e prea lung."),
  species: z.string().trim().max(120).optional(),
  description: z.string().trim().max(2000).optional(),
  location: z.string().trim().max(80).optional(),
  sunlight: z.enum(SUNLIGHT_LEVELS).optional(),
  wateringIntervalDays: z.coerce
    .number()
    .int()
    .min(1, "Cel putin o zi.")
    .max(365, "Cel mult un an."),
  wateredNow: z.coerce.boolean().optional(),
  care: z.string().optional(),
});

/** Textele de ingrijire vin din identificare, ca JSON intr-un camp ascuns. */
const careSchema = z.object({
  light: z.string().max(120).optional(),
  watering: z.string().max(120).optional(),
  humidity: z.string().max(120).optional(),
  temperature: z.string().max(120).optional(),
});

function readCare(raw: string | undefined) {
  if (!raw) return {};

  try {
    const parsed = careSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : {};
  } catch {
    /* Camp stricat sau umblat: mergem mai departe fara sfaturi, nu cadem. */
    return {};
  }
}

export async function addPlantAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = plantFormSchema.safeParse({
    name: formData.get("name"),
    species: formData.get("species") || undefined,
    description: formData.get("description") || undefined,
    location: formData.get("location") || undefined,
    sunlight: formData.get("sunlight") || undefined,
    wateringIntervalDays: formData.get("wateringIntervalDays"),
    wateredNow: formData.get("wateredNow") || undefined,
    care: formData.get("care") || undefined,
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { error: first?.message ?? "Verifica datele introduse." };
  }

  let id: string;

  try {
    id = await createPlant({
      name: parsed.data.name,
      species: parsed.data.species,
      description: parsed.data.description,
      location: parsed.data.location,
      sunlight: parsed.data.sunlight,
      wateringIntervalDays: parsed.data.wateringIntervalDays,
      wateredNow: parsed.data.wateredNow,
      care: readCare(parsed.data.care),
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Nu s-a putut salva." };
  }

  /* Poza aleasa la adaugare devine prima poza si coperta. Fara pasul asta ar
     fi folosita doar la identificare si pierduta - iar ea ar trebui sa o adauge
     a doua oara, din ecranul plantei.

     Esecul aici nu anuleaza planta: planta exista si e ce conteaza. */
  const photo = formData.get("photo");

  if (photo instanceof File && photo.size > 0) {
    try {
      const uploaded = await uploadPhoto({ plantId: id, file: photo });
      await updatePlant(id, { coverPhotoId: uploaded.id });
    } catch (error) {
      console.error("Poza nu a putut fi salvata la adaugare:", error);
    }
  }

  revalidatePath("/");
  revalidatePath("/journal");

  /* `redirect` arunca prin design, deci sta in afara blocului try. */
  redirect(`/plants/${id}`);
}

export async function waterPlantAction(formData: FormData): Promise<void> {
  const id = String(formData.get("plantId") ?? "");
  if (!id) return;

  await waterPlant(id);

  revalidatePath("/");
  revalidatePath("/journal");
  revalidatePath(`/plants/${id}`);
}

export async function addNoteAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const plantId = String(formData.get("plantId") ?? "") || null;
  const text = String(formData.get("text") ?? "").trim();

  if (!text) return { error: "Scrie ceva intai." };
  if (text.length > 2000) return { error: "Insemnarea e prea lunga." };

  try {
    await addNote(plantId, text);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Nu s-a putut salva." };
  }

  revalidatePath("/journal");
  if (plantId) revalidatePath(`/plants/${plantId}`);

  return OK;
}

export async function uploadPhotoAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const plantId = String(formData.get("plantId") ?? "");
  const file = formData.get("photo");

  if (!plantId) return { error: "Lipseste planta." };
  if (!(file instanceof File) || file.size === 0) return { error: "Alege o poza." };

  try {
    await uploadPhoto({
      plantId,
      file,
      width: Number(formData.get("width")) || undefined,
      height: Number(formData.get("height")) || undefined,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Nu s-a putut incarca." };
  }

  revalidatePath(`/plants/${plantId}`);
  revalidatePath("/journal");

  return OK;
}

export async function setCoverPhotoAction(formData: FormData): Promise<void> {
  const plantId = String(formData.get("plantId") ?? "");
  const photoId = String(formData.get("photoId") ?? "");
  if (!plantId || !photoId) return;

  await updatePlant(plantId, { coverPhotoId: photoId });

  revalidatePath("/");
  revalidatePath(`/plants/${plantId}`);
}

export async function deletePlantAction(formData: FormData): Promise<void> {
  const id = String(formData.get("plantId") ?? "");
  if (!id) return;

  await deletePlant(id);

  revalidatePath("/");
  revalidatePath("/journal");
  redirect("/");
}
