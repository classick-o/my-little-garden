import "server-only";

import { supabaseServer, requireUser } from "@/lib/supabase/server";
import type { PlantEventType } from "@/lib/supabase/database";

/**
 * Istoria gradinii.
 *
 * Un singur tabel pentru tot ce s-a intamplat (first-context.md sectiunea 19).
 * Alimenteaza si activitatea recenta a unei plante, si Jurnalul.
 */

export type GardenEvent = {
  id: string;
  plantId: string | null;
  /** Numele plantei la momentul citirii. Lipseste daca planta a fost stearsa. */
  plantName: string | null;
  type: PlantEventType;
  metadata: Record<string, unknown>;
  createdAt: Date;
};

type EventRowWithPlant = {
  id: string;
  plant_id: string | null;
  type: PlantEventType;
  metadata: Record<string, unknown>;
  created_at: string;
  plants: { name: string } | null;
};

function fromRow(row: EventRowWithPlant): GardenEvent {
  return {
    id: row.id,
    plantId: row.plant_id,
    plantName: row.plants?.name ?? null,
    type: row.type,
    metadata: row.metadata ?? {},
    createdAt: new Date(row.created_at),
  };
}

/**
 * Jurnalul: tot ce s-a intamplat, cronologic invers.
 *
 * Numele plantei vine din aceeasi cerere, printr-o imbinare. Altfel ar fi
 * urmat o cerere pe fiecare rand - exact ce interzice sectiunea 61.
 */
export async function listJournal(limit = 50): Promise<GardenEvent[]> {
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("plant_events")
    .select("id, plant_id, type, metadata, created_at, plants ( name )")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Nu s-a putut citi jurnalul: ${error.message}`);

  return (data as unknown as EventRowWithPlant[]).map(fromRow);
}

/** Activitatea recenta a unei singure plante. */
export async function listPlantEvents(
  plantId: string,
  limit = 30,
): Promise<GardenEvent[]> {
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("plant_events")
    .select("id, plant_id, type, metadata, created_at, plants ( name )")
    .eq("plant_id", plantId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Nu s-a putut citi istoricul: ${error.message}`);

  return (data as unknown as EventRowWithPlant[]).map(fromRow);
}

export async function addEvent(
  type: PlantEventType,
  plantId: string | null,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  const user = await requireUser();
  const supabase = await supabaseServer();

  const { error } = await supabase.from("plant_events").insert({
    plant_id: plantId,
    user_id: user.id,
    type,
    metadata,
  });

  if (error) throw new Error(`Nu s-a putut salva in istoric: ${error.message}`);
}

/** O insemnare scrisa de ea. Textul sta in metadata, nu intr-un tabel nou. */
export async function addNote(plantId: string | null, text: string): Promise<void> {
  await addEvent("note_added", plantId, { text: text.trim() });
}
