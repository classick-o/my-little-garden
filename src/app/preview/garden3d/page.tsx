import { Backdrop } from "@/components/app-shell/Backdrop";
import { GardenScene } from "@/components/garden3d/GardenScene";

/**
 * TEST VIZUAL - nu face parte din aplicatie.
 *
 * Gradina 3D cu modele generate, ca sa vedem daca stilul se tine si cum arata
 * miscarea. Se sterge dupa ce decidem.
 */
export const metadata = { title: "Test - gradina 3D" };

export default function Garden3DPage() {
  return (
    <>
      <Backdrop />
      <GardenScene />
    </>
  );
}
