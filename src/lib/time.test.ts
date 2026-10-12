import { describe, expect, it } from "vitest";

import { currentHour, daysAgoLabel, dueLabel, greeting, shortDate } from "./time";

/** Punct fix in timp, ca testele sa nu depinda de cand sunt rulate. */
const NOON = new Date("2026-03-18T10:00:00.000Z");

describe("currentHour", () => {
  it("foloseste fusul utilizatorului, nu al serverului", () => {
    /* 10:00 UTC inseamna 12:00 in Bucuresti in martie. */
    expect(currentHour(NOON)).toBe(12);
  });
});

describe("greeting", () => {
  it("se schimba cu ora", () => {
    expect(greeting(new Date("2026-03-18T05:00:00.000Z"))).toBe("Buna dimineata");
    expect(greeting(NOON)).toBe("Buna ziua");
    expect(greeting(new Date("2026-03-18T19:00:00.000Z"))).toBe("Buna seara");
  });
});

describe("daysAgoLabel", () => {
  it("spune in cuvinte cat a trecut", () => {
    expect(daysAgoLabel(null)).toBe("niciodata");
    expect(daysAgoLabel(0)).toBe("azi");
    expect(daysAgoLabel(1)).toBe("ieri");
    expect(daysAgoLabel(5)).toBe("acum 5 zile");
  });
});

describe("dueLabel", () => {
  it("spune cand urmeaza", () => {
    expect(dueLabel(0)).toBe("azi");
    expect(dueLabel(1)).toBe("maine");
    expect(dueLabel(4)).toBe("in 4 zile");
  });

  it("spune intarzierea ca intarziere, nu ca zile negative", () => {
    expect(dueLabel(-1)).toBe("de ieri");
    expect(dueLabel(-3)).toBe("de acum 3 zile");
  });

  it("nu inventeaza o scadenta pentru o planta neudata niciodata", () => {
    expect(dueLabel(null)).toBe("cand vrei tu");
  });
});

describe("shortDate", () => {
  it("scrie data scurt, fara punct dupa luna", () => {
    expect(shortDate(NOON)).toBe("18 mar");
  });
});
