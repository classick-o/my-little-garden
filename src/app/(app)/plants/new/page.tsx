import { NewPlantForm } from "./NewPlantForm";

/**
 * Adauga o planta.
 *
 * Sectiunea 44 cere doua cai: manuala si cu ajutorul asistentului. Sunt in
 * acelasi formular, nu pe ecrane diferite - asistentul doar precompleteaza
 * campurile, ea ramane cea care decide.
 */
export const metadata = { title: "Adauga o planta" };

export default function NewPlantPage() {
  return (
    <div>
      <h1 className="text-[2rem]">Adauga o planta</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        Fa-i o poza si lasa asistentul sa o recunoasca, sau completeaza tu.
      </p>

      <NewPlantForm />
    </div>
  );
}
