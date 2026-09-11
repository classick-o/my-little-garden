import { describe, expect, it } from "vitest";

import {
  careStatus,
  daysSinceWatering,
  daysUntilWatering,
  isDueForWatering,
  nextWateringAt,
} from "./watering";

/** Punct fix in timp, ca testele sa nu depinda de cand sunt rulate. */
const NOW = new Date("2026-03-18T12:00:00.000Z");

/** Un moment cu `days` zile in urma fata de NOW. */
function daysAgo(days: number): Date {
  return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000);
}

describe("nextWateringAt", () => {
  it("adauga intervalul la ultima udare", () => {
    const next = nextWateringAt({
      lastWateredAt: daysAgo(3),
      wateringIntervalDays: 7,
    });

    expect(next).toEqual(new Date("2026-03-22T12:00:00.000Z"));
  });

  it("nu poate calcula nimic daca planta nu a fost udata niciodata", () => {
    expect(
      nextWateringAt({ lastWateredAt: null, wateringIntervalDays: 7 }),
    ).toBeNull();
  });
});

describe("daysSinceWatering", () => {
  it("rotunjeste in jos: 3 zile si jumatate inseamna 3 zile", () => {
    expect(daysSinceWatering(daysAgo(3.5), NOW)).toBe(3);
  });

  it("intoarce 0 in ziua udarii", () => {
    expect(daysSinceWatering(daysAgo(0), NOW)).toBe(0);
  });

  it("intoarce null daca planta nu a fost udata niciodata", () => {
    expect(daysSinceWatering(null, NOW)).toBeNull();
  });
});

describe("daysUntilWatering", () => {
  it("numara zilele ramase", () => {
    expect(
      daysUntilWatering({ lastWateredAt: daysAgo(3), wateringIntervalDays: 7 }, NOW),
    ).toBe(4);
  });

  it("intoarce 0 chiar in ziua in care e programata udarea", () => {
    expect(
      daysUntilWatering({ lastWateredAt: daysAgo(7), wateringIntervalDays: 7 }, NOW),
    ).toBe(0);
  });

  it("intoarce valori negative pentru intarziere", () => {
    expect(
      daysUntilWatering({ lastWateredAt: daysAgo(10), wateringIntervalDays: 7 }, NOW),
    ).toBe(-3);
  });
});

describe("isDueForWatering", () => {
  it("o planta neudata niciodata are nevoie de apa", () => {
    expect(
      isDueForWatering({ lastWateredAt: null, wateringIntervalDays: 7 }, NOW),
    ).toBe(true);
  });

  it("nu inainte de termen", () => {
    expect(
      isDueForWatering({ lastWateredAt: daysAgo(3), wateringIntervalDays: 7 }, NOW),
    ).toBe(false);
  });

  it("da, la termen", () => {
    expect(
      isDueForWatering({ lastWateredAt: daysAgo(7), wateringIntervalDays: 7 }, NOW),
    ).toBe(true);
  });
});

describe("careStatus", () => {
  it("e sanatoasa cand mai are timp", () => {
    expect(
      careStatus({ lastWateredAt: daysAgo(2), wateringIntervalDays: 7 }, NOW),
    ).toBe("healthy");
  });

  it("cere apa la termen", () => {
    expect(
      careStatus({ lastWateredAt: daysAgo(7), wateringIntervalDays: 7 }, NOW),
    ).toBe("needs_water");
  });

  it("cere apa si cand e putin intarziata", () => {
    expect(
      careStatus({ lastWateredAt: daysAgo(10), wateringIntervalDays: 7 }, NOW),
    ).toBe("needs_water");
  });

  it("cere atentie cand intarzierea devine serioasa", () => {
    expect(
      careStatus({ lastWateredAt: daysAgo(14), wateringIntervalDays: 7 }, NOW),
    ).toBe("needs_attention");
  });

  it("o planta noua cere apa, dar nu e un motiv de ingrijorare", () => {
    expect(
      careStatus({ lastWateredAt: null, wateringIntervalDays: 7 }, NOW),
    ).toBe("needs_water");
  });
});
