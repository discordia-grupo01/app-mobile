import { boostLevelFailure } from "./boostLevelFailure";

describe("boostLevelFailure", () => {
  it("un GIF sin nivel 1 marca el campo del ícono", () => {
    expect(
      boostLevelFailure({ reason: "boost_level_required", required_level: 1 }),
    ).toEqual({
      ok: false,
      message: "Este servidor necesita el nivel 1 de boosts para eso.",
      fieldErrors: {
        icon: "Este servidor necesita el nivel 1 de boosts para eso.",
      },
    });
  });

  it("un banner sin nivel 2 marca el campo del banner", () => {
    expect(
      boostLevelFailure({ reason: "boost_level_required", required_level: 2 }),
    ).toEqual({
      ok: false,
      message: "Este servidor necesita el nivel 2 de boosts para eso.",
      fieldErrors: {
        banner: "Este servidor necesita el nivel 2 de boosts para eso.",
      },
    });
  });

  it("un nivel sin campo en este formulario queda como error general", () => {
    expect(
      boostLevelFailure({ reason: "boost_level_required", required_level: 3 }),
    ).toEqual({
      ok: false,
      message: "Este servidor necesita el nivel 3 de boosts para eso.",
    });
  });

  it("deja pasar el 403 de falta de permiso", () => {
    expect(boostLevelFailure(undefined)).toBeUndefined();
    expect(boostLevelFailure({ reason: "forbidden" })).toBeUndefined();
  });
});
