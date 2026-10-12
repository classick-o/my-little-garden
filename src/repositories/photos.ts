import "server-only";

import { supabaseServer, requireUser } from "@/lib/supabase/server";

/**
 * Pozele plantelor.
 *
 * Bucket-ul `plant-photos` e privat. Fiecare fisier sta intr-un dosar numit cu
 * id-ul utilizatorului, iar politicile din migratie verifica exact asta - deci
 * calea nu e doar o conventie, e si regula de acces.
 */

const BUCKET = "plant-photos";

/** Cat timp e valabila o adresa semnata. O ora acopera o vizita linistita. */
const SIGNED_URL_SECONDS = 60 * 60;

export type PlantPhoto = {
  id: string;
  plantId: string;
  storagePath: string;
  width: number | null;
  height: number | null;
  createdAt: Date;
  /** Adresa temporara de afisare. Bucket-ul fiind privat, nu exista una fixa. */
  url: string | null;
};

export async function listPhotos(plantId: string): Promise<PlantPhoto[]> {
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("plant_photos")
    .select("*")
    .eq("plant_id", plantId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Nu s-au putut citi pozele: ${error.message}`);

  const rows = data ?? [];
  if (rows.length === 0) return [];

  /* O singura cerere pentru toate adresele, nu una pe poza. */
  const { data: signed } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(
      rows.map((row) => row.storage_path),
      SIGNED_URL_SECONDS,
    );

  const urlByPath = new Map(
    (signed ?? []).map((item) => [item.path ?? "", item.signedUrl]),
  );

  return rows.map((row) => ({
    id: row.id,
    plantId: row.plant_id,
    storagePath: row.storage_path,
    width: row.width,
    height: row.height,
    createdAt: new Date(row.created_at),
    url: urlByPath.get(row.storage_path) ?? null,
  }));
}

/** Adresa semnata pentru o singura poza. Null daca nu exista calea. */
export async function signedPhotoUrl(storagePath: string | null): Promise<string | null> {
  if (!storagePath) return null;

  const supabase = await supabaseServer();
  const { data } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_SECONDS);

  return data?.signedUrl ?? null;
}

export type UploadedPhoto = { id: string; storagePath: string };

/**
 * Urca o poza si o inregistreaza.
 *
 * Fisierul vine deja micsorat din browser (sectiunea 22): urcam ce primim, nu
 * prelucram aici. Un fisier mare ar fi fost oprit oricum de limita bucket-ului.
 */
export async function uploadPhoto({
  plantId,
  file,
  width,
  height,
}: {
  plantId: string;
  file: File;
  width?: number;
  height?: number;
}): Promise<UploadedPhoto> {
  const user = await requireUser();
  const supabase = await supabaseServer();

  const extension = file.type === "image/png" ? "png" : file.type === "image/jpeg" ? "jpg" : "webp";

  /* Dosarul utilizatorului e primul segment: politicile de storage se uita
     exact la el. Apoi planta, ca sa fie usor de gasit si de sters. */
  const storagePath = `${user.id}/${plantId}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    throw new Error(`Nu s-a putut incarca poza: ${uploadError.message}`);
  }

  const { data, error } = await supabase
    .from("plant_photos")
    .insert({
      plant_id: plantId,
      user_id: user.id,
      storage_path: storagePath,
      thumbnail_path: null,
      width: width ?? null,
      height: height ?? null,
    })
    .select("id")
    .single();

  if (error) {
    /* Randul nu s-a scris, deci fisierul ar ramane orfan in bucket. */
    await supabase.storage.from(BUCKET).remove([storagePath]);
    throw new Error(`Nu s-a putut salva poza: ${error.message}`);
  }

  await supabase.from("plant_events").insert({
    plant_id: plantId,
    user_id: user.id,
    type: "photo_added",
    metadata: { photo_id: data.id },
  });

  return { id: data.id, storagePath };
}

export async function deletePhoto(id: string): Promise<void> {
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("plant_photos")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Nu s-a putut citi poza: ${error.message}`);
  if (!data) return;

  const { error: deleteError } = await supabase
    .from("plant_photos")
    .delete()
    .eq("id", id);

  if (deleteError) {
    throw new Error(`Nu s-a putut sterge poza: ${deleteError.message}`);
  }

  await supabase.storage.from(BUCKET).remove([data.storage_path]);
}

/**
 * Adresele semnate pentru pozele de coperta ale mai multor plante.
 *
 * O singura cerere pentru toate, nu una pe planta: ecranul Gradina le arata pe
 * toate deodata, iar N cereri ar fi exact ce interzice sectiunea 61.
 */
export async function coverUrls(
  photoIds: (string | null)[],
): Promise<Map<string, string>> {
  const ids = photoIds.filter((id): id is string => Boolean(id));
  if (ids.length === 0) return new Map();

  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("plant_photos")
    .select("id, storage_path")
    .in("id", ids);

  if (error || !data?.length) return new Map();

  const { data: signed } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(
      data.map((row) => row.storage_path),
      SIGNED_URL_SECONDS,
    );

  const urlByPath = new Map(
    (signed ?? []).map((item) => [item.path ?? "", item.signedUrl]),
  );

  return new Map(
    data
      .map((row) => [row.id, urlByPath.get(row.storage_path)] as const)
      .filter((pair): pair is readonly [string, string] => Boolean(pair[1])),
  );
}
