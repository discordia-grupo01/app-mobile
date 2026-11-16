import { clampOffset, dragBoundsOf } from "./bannerDrag";

const bounds = dragBoundsOf({
  banner: { x: 100, y: 120, width: 200, height: 40 },
  screen: { width: 400, height: 800 },
  insets: { top: 30, right: 0, bottom: 20, left: 0 },
  margin: 8,
});

describe("dragBoundsOf", () => {
  it("deja moverlo hasta los bordes respetando el notch y la barra", () => {
    expect(bounds).toEqual({ minX: -92, maxX: 92, minY: -82, maxY: 612 });
  });
});

describe("clampOffset", () => {
  it("deja pasar un movimiento dentro de la pantalla", () => {
    expect(clampOffset({ x: 30, y: 200 }, bounds)).toEqual({ x: 30, y: 200 });
  });

  it("frena el banner en los bordes", () => {
    expect(clampOffset({ x: -500, y: 900 }, bounds)).toEqual({
      x: -92,
      y: 612,
    });
    expect(clampOffset({ x: 500, y: -900 }, bounds)).toEqual({
      x: 92,
      y: -82,
    });
  });

  it("si no entra de costado, lo deja donde esta en ese eje", () => {
    expect(
      clampOffset({ x: 10, y: 0 }, { minX: 4, maxX: -4, minY: 0, maxY: 10 }),
    ).toEqual({ x: 4, y: 0 });
  });
});
