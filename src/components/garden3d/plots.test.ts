import { describe, expect, it } from "vitest";

import { nearestPlot, place, PLOTS, type Placed } from "./plots";

/** Doua plante, in parcelele 0 si 2. */
function garden(): Placed[] {
  return [
    { id: "luna", plot: 0 },
    { id: "stela", plot: 2 },
  ];
}

describe("nearestPlot", () => {
  it("gaseste parcela pe care stai exact", () => {
    for (let i = 0; i < PLOTS.length; i++) {
      expect(nearestPlot(PLOTS[i].x, PLOTS[i].z)).toBe(i);
    }
  });

  it("alege parcela cea mai apropiata cand esti intre doua", () => {
    const first = PLOTS[0];
    const second = PLOTS[1];

    /* Putin peste mijlocul dintre ele, inspre a doua. */
    const x = first.x + (second.x - first.x) * 0.6;
    const z = first.z + (second.z - first.z) * 0.6;

    expect(nearestPlot(x, z)).toBe(1);
  });

  it("intoarce mereu o parcela valida, oricat de departe ai fi", () => {
    const index = nearestPlot(99, -99);

    expect(index).toBeGreaterThanOrEqual(0);
    expect(index).toBeLessThan(PLOTS.length);
  });
});

describe("place", () => {
  it("muta planta intr-o parcela libera", () => {
    const result = place(garden(), "luna", 4);

    expect(result.find((p) => p.id === "luna")?.plot).toBe(4);
    expect(result.find((p) => p.id === "stela")?.plot).toBe(2);
  });

  it("schimba locurile cand parcela e ocupata", () => {
    const result = place(garden(), "luna", 2);

    expect(result.find((p) => p.id === "luna")?.plot).toBe(2);
    expect(result.find((p) => p.id === "stela")?.plot).toBe(0);
  });

  it("nu schimba nimic daca planta e deja acolo", () => {
    const before = garden();
    const result = place(before, "luna", 0);

    expect(result).toBe(before);
  });

  it("nu schimba nimic fara parcela tinta", () => {
    const before = garden();

    expect(place(before, "luna", null)).toBe(before);
  });

  it("ignora o planta care nu exista", () => {
    const before = garden();

    expect(place(before, "nimeni", 3)).toBe(before);
  });

  it("nu lasa niciodata doua plante in aceeasi parcela", () => {
    let plants: Placed[] = [
      { id: "a", plot: 0 },
      { id: "b", plot: 1 },
      { id: "c", plot: 2 },
    ];

    /* Mutari repetate, inclusiv peste parcele ocupate. */
    plants = place(plants, "a", 1);
    plants = place(plants, "c", 0);
    plants = place(plants, "b", 2);

    const occupied = plants.map((plant) => plant.plot);

    expect(new Set(occupied).size).toBe(plants.length);
  });
});
