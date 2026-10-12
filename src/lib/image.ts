"use client";

/**
 * Micsorarea pozelor, in browser, inainte de orice urcare
 * (first-context.md sectiunea 22).
 *
 * O poza facuta cu telefonul are 3-5 MB. Urcata ca atare ar consuma datele ei,
 * ar incetini ecranul si ar umple bucket-ul degeaba. Micsorata la 1280px si
 * trecuta in webp ajunge la cateva sute de kilobytes, fara diferenta vizibila
 * pe un ecran de telefon.
 *
 * Se face aici, nu pe server: asa economisim si urcarea, nu doar stocarea.
 */

/** Latura maxima. 1280 acopera si ecranele cu densitate mare la latime de card. */
const MAX_SIZE = 1280;

/** Destul cat sa nu se vada artefacte pe frunze, destul de mic cat sa conteze. */
const QUALITY = 0.82;

export type ResizedImage = {
  file: File;
  width: number;
  height: number;
};

export async function resizeImage(
  input: File,
  maxSize: number = MAX_SIZE,
): Promise<ResizedImage> {
  const bitmap = await createImageBitmap(input);

  try {
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Nu s-a putut pregati poza.");

    context.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", QUALITY),
    );

    if (!blob) throw new Error("Nu s-a putut pregati poza.");

    const file = new File([blob], renameToWebp(input.name), {
      type: "image/webp",
    });

    return { file, width, height };
  } finally {
    /* Imaginea decodata tine memorie cat un cadru intreg. Pe telefon, cateva
       poze la rand fara eliberare duc la oprirea filei. */
    bitmap.close();
  }
}

function renameToWebp(name: string) {
  const base = name.replace(/\.[^./\\]+$/, "") || "poza";
  return `${base}.webp`;
}
