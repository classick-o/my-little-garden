/**
 * Parcelele in care stau plantele.
 *
 * Plantele nu se aseaza oriunde, ci in locuri anume. Doua motive:
 * gradina ramane ordonata oricat de mult le-ar muta, si fiecare planta are un
 * loc al ei, care inseamna ceva - exact ca intr-o gradina adevarata.
 */

export type Plot = {
  x: number;
  z: number;
};

/** Distanta dintre parcele. Destul cat plantele mari sa nu se atinga. */
const SPACING = 1.02;

/* Doua randuri de cate trei, usor spre fata insulei. In spate raman copacii
   si arcada. */
export const PLOTS: Plot[] = [
  { x: -SPACING, z: -0.42 },
  { x: 0, z: -0.42 },
  { x: SPACING, z: -0.42 },
  { x: -SPACING, z: 0.72 },
  { x: 0, z: 0.72 },
  { x: SPACING, z: 0.72 },
];

/** Latura unei parcele. */
export const PLOT_SIZE = 0.82;

/** Indexul parcelei celei mai apropiate de un punct de pe sol. */
export function nearestPlot(x: number, z: number): number {
  let best = 0;
  let bestDistance = Infinity;

  for (let i = 0; i < PLOTS.length; i++) {
    const distance = (PLOTS[i].x - x) ** 2 + (PLOTS[i].z - z) ** 2;

    if (distance < bestDistance) {
      bestDistance = distance;
      best = i;
    }
  }

  return best;
}

/** Orice obiect care ocupa o parcela. */
export type Placed = { id: string; plot: number };

/**
 * Aseaza o planta intr-o parcela.
 *
 * Daca parcela e ocupata, cele doua plante isi schimba locurile. Asa nu exista
 * mutare invalida: orice ai trage undeva, se intampla ceva cu sens - si nu
 * ramane nicio planta fara loc.
 */
export function place<T extends Placed>(items: T[], id: string, plot: number | null): T[] {
  if (plot === null) return items;

  const moving = items.find((item) => item.id === id);
  if (!moving || moving.plot === plot) return items;

  const occupant = items.find((item) => item.plot === plot);

  return items.map((item) => {
    if (item.id === id) return { ...item, plot };
    if (occupant && item.id === occupant.id) return { ...item, plot: moving.plot };
    return item;
  });
}
