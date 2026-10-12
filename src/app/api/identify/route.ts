import { NextResponse, type NextRequest } from "next/server";

import { AIError, aiService, type AIErrorCode } from "@/services/ai";
import { currentUser } from "@/lib/supabase/server";

/**
 * Identificarea plantei dintr-o poza.
 *
 * AI-ul se cheama exclusiv din Route Handlers (CLAUDE.md sectiunea 3): cheia
 * ramane pe server si nu ajunge niciodata in browser.
 *
 * Route Handlers nu sunt cache-uite implicit in Next 16 - exact ce vrem aici.
 */

/** Cat accepta modelul. Peste atat, refuzam inainte sa cheltuim o cerere. */
const MAX_BYTES = 4 * 1024 * 1024;

const ACCEPTED = ["image/webp", "image/jpeg", "image/png"] as const;

type AcceptedType = (typeof ACCEPTED)[number];

function isAccepted(type: string): type is AcceptedType {
  return (ACCEPTED as readonly string[]).includes(type);
}

/** Ce cod HTTP merita fiecare fel de esec. */
const STATUS: Record<AIErrorCode, number> = {
  not_configured: 503,
  rate_limited: 429,
  invalid_response: 502,
  blocked: 422,
  unavailable: 503,
  bad_input: 400,
  unknown: 500,
};

export async function POST(request: NextRequest) {
  /* Aplicatia e privata si fiecare cerere costa. Fara verificarea asta, ruta
     ar fi o cheie Gemini gratuita pentru oricine o gaseste. */
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Nu esti conectat." }, { status: 401 });
  }

  const form = await request.formData();
  const photo = form.get("photo");

  if (!(photo instanceof File) || photo.size === 0) {
    return NextResponse.json({ error: "Lipseste poza." }, { status: 400 });
  }

  if (photo.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Poza e prea mare. Micsoreaz-o si incearca din nou." },
      { status: 413 },
    );
  }

  if (!isAccepted(photo.type)) {
    return NextResponse.json(
      { error: "Formatul pozei nu e acceptat." },
      { status: 415 },
    );
  }

  try {
    const base64 = Buffer.from(await photo.arrayBuffer()).toString("base64");

    const { data, meta } = await aiService().identifyPlant({
      base64,
      mimeType: photo.type,
    });

    return NextResponse.json({ data, meta });
  } catch (error) {
    if (error instanceof AIError) {
      /* Mesajul pentru om vine din serviciu, deja in romana. Codul il trimitem
         ca sa stie interfata daca merita oferit un buton de reincercare. */
      return NextResponse.json(
        { error: error.userMessage, code: error.code, retryable: error.retryable },
        { status: STATUS[error.code] },
      );
    }

    console.error("Identificare esuata:", error);

    return NextResponse.json(
      { error: "Ceva nu a mers bine. Mai incearca o data." },
      { status: 500 },
    );
  }
}
