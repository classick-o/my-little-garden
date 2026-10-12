import "server-only";

import { supabaseServer, requireUser } from "@/lib/supabase/server";
import type { CareJson, PlantRow, SunlightLevel } from "@/lib/supabase/database";
import {
  careStatus,
  daysSinceWatering,
  daysUntilWatering,
  nextWateringAt,
  type CareStatus,
} from "@/lib/watering";

/**
 * Plantele. Singurul loc care vorbeste cu Supabase despre ele.
 *
 * Nicio componenta nu are voie sa interogheze direct (CLAUDE.md sectiunea 3).
 * Motivul practic: cand se schimba o coloana, se schimba un fisier, nu
 * paisprezece.
 */

/** O planta asa cum o vede aplicatia: randul din baza plus ce se calculeaza. */
export type Plant = {
  id: string;
  name: string;
  species: string | null;
  description: string | null;
  location: string | null;
  sunlight: SunlightLevel | null;
  wateringIntervalDays: number;
  lastWateredAt: Date | null;
  care: CareJson;
  coverPhotoId: string | null;
  createdAt: Date;

  /* Calculate, nu stocate: o singura sursa de adevar - `last_watered_at` plus
     intervalul (CLAUDE.md, jurnalul de decizii, 11 septembrie). */
  nextWateringAt: Date | null;
  daysSinceWatering: number | null;
  daysUntilWatering: number | null;
  status: CareStatus;
  daysOwned: number;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function fromRow(row: PlantRow, now: Date): Plant {
  const lastWateredAt = row.last_watered_at ? new Date(row.last_watered_at) : null;
  const schedule = {
    lastWateredAt,
    wateringIntervalDays: row.watering_interval_days,
  };

  const createdAt = new Date(row.created_at);

  return {
    id: row.id,
    name: row.name,
    species: row.species,
    description: row.description,
    location: row.location,
    sunlight: row.sunlight,
    wateringIntervalDays: row.watering_interval_days,
    lastWateredAt,
    care: row.care ?? {},
    coverPhotoId: row.cover_photo_id,
    createdAt,

    nextWateringAt: nextWateringAt(schedule),
    daysSinceWatering: daysSinceWatering(lastWateredAt, now),
    daysUntilWatering: daysUntilWatering(schedule, now),
    status: careStatus(schedule, now),
    daysOwned: Math.max(0, Math.floor((now.getTime() - createdAt.getTime()) / MS_PER_DAY)),
  };
}

/**
 * Toate plantele, cele care au nevoie de apa primele.
 *
 * Ordonarea se face aici, nu in SQL: "are nevoie de apa" se calculeaza din
 * doua coloane, iar o planta neudata niciodata nu are de la ce porni. In SQL
 * ar fi iesit o expresie pe care nimeni nu ar mai fi inteles-o peste o luna,
 * iar numarul de plante e mic - zeci, nu mii.
 */
export async function listPlants(now: Date = new Date()): Promise<Plant[]> {
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("plants")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Nu s-au putut citi plantele: ${error.message}`);

  const plants = (data ?? []).map((row) => fromRow(row, now));

  return plants.sort((a, b) => {
    const left = a.daysUntilWatering ?? Number.NEGATIVE_INFINITY;
    const right = b.daysUntilWatering ?? Number.NEGATIVE_INFINITY;
    return left - right;
  });
}

export async function getPlant(
  id: string,
  now: Date = new Date(),
): Promise<Plant | null> {
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("plants")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Nu s-a putut citi planta: ${error.message}`);

  return data ? fromRow(data, now) : null;
}

export type NewPlant = {
  name: string;
  species?: string | null;
  description?: string | null;
  location?: string | null;
  sunlight?: SunlightLevel | null;
  wateringIntervalDays: number;
  care?: CareJson;
  /** Daca planta a fost udata chiar la adaugare. */
  wateredNow?: boolean;
};

/**
 * Adauga o planta si inregistreaza evenimentul de creare.
 *
 * Cele doua scrieri nu sunt o tranzactie. Daca a doua esueaza, planta exista
 * fara evenimentul ei - suparator, dar nu stricat: ecranele citesc planta, iar
 * jurnalul are doar o linie in minus. Invers ar fi fost mai rau.
 */
export async function createPlant(input: NewPlant): Promise<string> {
  const user = await requireUser();
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("plants")
    .insert({
      user_id: user.id,
      name: input.name.trim(),
      species: input.species?.trim() || null,
      description: input.description?.trim() || null,
      location: input.location?.trim() || null,
      sunlight: input.sunlight ?? null,
      watering_interval_days: input.wateringIntervalDays,
      last_watered_at: input.wateredNow ? new Date().toISOString() : null,
      care: input.care ?? {},
      cover_photo_id: null,
    })
    .select("id")
    .single();

  if (error) throw new Error(`Nu s-a putut adauga planta: ${error.message}`);

  await supabase.from("plant_events").insert({
    plant_id: data.id,
    user_id: user.id,
    type: "created",
    metadata: { name: input.name.trim() },
  });

  return data.id;
}

export type PlantPatch = {
  name?: string;
  species?: string | null;
  description?: string | null;
  location?: string | null;
  sunlight?: SunlightLevel | null;
  wateringIntervalDays?: number;
  coverPhotoId?: string | null;
};

export async function updatePlant(id: string, patch: PlantPatch): Promise<void> {
  const supabase = await supabaseServer();

  const { error } = await supabase
    .from("plants")
    .update({
      ...(patch.name !== undefined && { name: patch.name.trim() }),
      ...(patch.species !== undefined && { species: patch.species?.trim() || null }),
      ...(patch.description !== undefined && {
        description: patch.description?.trim() || null,
      }),
      ...(patch.location !== undefined && { location: patch.location?.trim() || null }),
      ...(patch.sunlight !== undefined && { sunlight: patch.sunlight }),
      ...(patch.wateringIntervalDays !== undefined && {
        watering_interval_days: patch.wateringIntervalDays,
      }),
      ...(patch.coverPhotoId !== undefined && { cover_photo_id: patch.coverPhotoId }),
    })
    .eq("id", id);

  if (error) throw new Error(`Nu s-a putut salva planta: ${error.message}`);
}

/** Marcheaza udarea acum si o trece in istoric. */
export async function waterPlant(id: string): Promise<void> {
  const user = await requireUser();
  const supabase = await supabaseServer();
  const wateredAt = new Date().toISOString();

  const { error } = await supabase
    .from("plants")
    .update({ last_watered_at: wateredAt })
    .eq("id", id);

  if (error) throw new Error(`Nu s-a putut marca udarea: ${error.message}`);

  await supabase.from("plant_events").insert({
    plant_id: id,
    user_id: user.id,
    type: "watered",
    metadata: {},
  });
}

export async function deletePlant(id: string): Promise<void> {
  const supabase = await supabaseServer();

  const { error } = await supabase.from("plants").delete().eq("id", id);

  if (error) throw new Error(`Nu s-a putut sterge planta: ${error.message}`);
}
