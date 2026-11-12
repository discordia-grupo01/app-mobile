import {
  boostNextLevelPitch,
  boostPathProgress,
  boostServerTitle,
} from "./boostPath";

describe("boostPathProgress", () => {
  it("arranca vacía y se llena al llegar a 30 boosts", () => {
    expect(boostPathProgress(0)).toBe(0);
    expect(boostPathProgress(30)).toBe(1);
    expect(boostPathProgress(45)).toBe(1);
  });

  it("cada nivel ocupa un tercio de la barra", () => {
    expect(boostPathProgress(5)).toBeCloseTo(1 / 3);
    expect(boostPathProgress(15)).toBeCloseTo(2 / 3);
  });

  it("avanza dentro del tramo según los boosts de ese nivel", () => {
    expect(boostPathProgress(10)).toBeCloseTo(1 / 3 + 0.5 / 3);
  });
});

describe("boostNextLevelPitch", () => {
  it("cuenta lo que falta para el próximo nivel y qué desbloquea", () => {
    expect(boostNextLevelPitch(0, 2)).toBe(
      "Con 3 boosts más llega al nivel 1: ícono animado y 20 emojis más.",
    );
    expect(boostNextLevelPitch(1, 14)).toBe(
      "Con 1 boost más llega al nivel 2: banner y adjuntos de 25 MB.",
    );
  });

  it("no hay nada que ofrecer en el nivel máximo", () => {
    expect(boostNextLevelPitch(3, 30)).toBeUndefined();
  });
});

describe("boostServerTitle", () => {
  it("nombra al servidor", () => {
    expect(boostServerTitle("Reunión IS2")).toBe("Boosteá Reunión IS2");
  });
});
