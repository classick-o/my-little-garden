import { describe, expect, it } from "vitest";

import {
  confidenceLevel,
  plantIdentificationSchema,
  toGeminiSchema,
} from "./schemas";

/** Un raspuns valid, folosit ca punct de plecare pentru variatii. */
function validResponse() {
  return {
    is_plant: true,
    common_name: "Monstera",
    scientific_name: "Monstera deliciosa",
    confidence: 0.92,
    care: {
      light: "Lumina indirecta, langa fereastra",
      watering: "La 7-10 zile, cand pamantul s-a uscat",
      humidity: "Medie spre ridicata",
      temperature: "18-28 grade",
    },
    suggested_watering_interval_days: 8,
    suggested_sunlight: "bright_indirect",
    interesting_facts: ["Vine din padurile tropicale ale Americii Centrale."],
  };
}

describe("plantIdentificationSchema", () => {
  it("accepta un raspuns complet", () => {
    expect(plantIdentificationSchema.safeParse(validResponse()).success).toBe(true);
  });

  it("respinge o incredere in afara intervalului 0-1", () => {
    const result = plantIdentificationSchema.safeParse({
      ...validResponse(),
      confidence: 1.4,
    });

    expect(result.success).toBe(false);
  });

  it("respinge un interval de udare care nu e numar intreg de zile", () => {
    const result = plantIdentificationSchema.safeParse({
      ...validResponse(),
      suggested_watering_interval_days: 7.5,
    });

    expect(result.success).toBe(false);
  });

  it("respinge o valoare de lumina pe care nu o cunoastem", () => {
    const result = plantIdentificationSchema.safeParse({
      ...validResponse(),
      suggested_sunlight: "foarte multa",
    });

    expect(result.success).toBe(false);
  });

  it("cere cel putin un lucru interesant", () => {
    const result = plantIdentificationSchema.safeParse({
      ...validResponse(),
      interesting_facts: [],
    });

    expect(result.success).toBe(false);
  });

  it("respinge un raspuns caruia ii lipsesc sfaturile de ingrijire", () => {
    const { care: _dropped, ...withoutCare } = validResponse();
    const result = plantIdentificationSchema.safeParse(withoutCare);

    expect(result.success).toBe(false);
  });
});

describe("confidenceLevel", () => {
  it("0.92 inseamna incredere mare", () => {
    expect(confidenceLevel(0.92)).toBe("high");
  });

  it("0.8 e deja incredere mare", () => {
    expect(confidenceLevel(0.8)).toBe("high");
  });

  it("0.6 inseamna incredere medie", () => {
    expect(confidenceLevel(0.6)).toBe("medium");
  });

  it("0.3 inseamna incredere mica", () => {
    expect(confidenceLevel(0.3)).toBe("low");
  });
});

describe("toGeminiSchema", () => {
  it("scoate cheia $schema, pe care Gemini nu o accepta", () => {
    const schema = toGeminiSchema(plantIdentificationSchema);

    expect(schema).not.toHaveProperty("$schema");
    expect(schema.type).toBe("object");
  });

  it("pastreaza campurile obligatorii", () => {
    const schema = toGeminiSchema(plantIdentificationSchema);

    expect(schema.required).toContain("confidence");
    expect(schema.required).toContain("is_plant");
  });
});
