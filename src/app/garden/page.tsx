import { CanvasGuard } from "@/components/garden3d/CanvasGuard";
import { GardenScene } from "@/components/garden3d/GardenScene";
import { SAMPLE_GARDEN } from "@/components/garden3d/sample-garden";

/**
 * Gradina vazuta in 3D.
 *
 * Sta in afara invelisului aplicatiei, fara bara de navigatie: scena ocupa tot
 * ecranul, iar cardul plantei urca tocmai de unde ar fi stat bara. Iesirea se
 * face din sageata din coltul de sus.
 *
 * Plantele sunt deocamdata cele de proba. Ecranul va citi din baza de date cand
 * exista autentificare si un depozit de plante - vezi docs/plan-gradina-3d.md.
 */
export const metadata = { title: "Gradina" };

export default function GardenPage() {
  return (
    <CanvasGuard>
      <GardenScene plants={SAMPLE_GARDEN} backHref="/" />
    </CanvasGuard>
  );
}
