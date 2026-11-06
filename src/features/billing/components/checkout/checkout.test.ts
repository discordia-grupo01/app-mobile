import { type CheckoutDeps, runCheckout } from "./checkout";

function deps(overrides: Partial<CheckoutDeps> = {}): CheckoutDeps {
  return {
    startPremium: jest.fn().mockResolvedValue({
      ok: true,
      data: { checkout_url: "https://mp/premium" },
    }),
    startPoints: jest.fn().mockResolvedValue({
      ok: true,
      data: { purchase_id: "p1", checkout_url: "https://mp/points" },
    }),
    openCheckout: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("runCheckout", () => {
  it("puntos: pide el checkout con la clave, abre MP y devuelve la compra", async () => {
    const d = deps();

    const outcome = await runCheckout(
      { kind: "points", packageId: "pack", points: 500, priceCents: 100 },
      "",
      "key",
      d,
    );

    expect(d.startPoints).toHaveBeenCalledWith("pack", "key");
    expect(d.openCheckout).toHaveBeenCalledWith("https://mp/points");
    expect(outcome).toEqual({
      ok: true,
      payment: { kind: "points", purchaseId: "p1" },
    });
  });

  it("Premium: manda el email y devuelve el pago de Premium", async () => {
    const d = deps();

    const outcome = await runCheckout(
      { kind: "premium", priceCents: 499_900 },
      "a@b.com",
      "key",
      d,
    );

    expect(d.startPremium).toHaveBeenCalledWith("a@b.com", "key");
    expect(outcome).toEqual({
      ok: true,
      payment: { kind: "premium", purchaseId: null },
    });
  });

  it("si el back falla no abre Mercado Pago", async () => {
    const d = deps({
      startPremium: jest.fn().mockResolvedValue({
        ok: false,
        code: "ALREADY_SUBSCRIBED",
        message: "ya tenés",
      }),
    });

    const outcome = await runCheckout(
      { kind: "premium", priceCents: 1 },
      "a@b.com",
      "key",
      d,
    );

    expect(d.openCheckout).not.toHaveBeenCalled();
    expect(outcome).toEqual({
      ok: false,
      code: "ALREADY_SUBSCRIBED",
      message: "ya tenés",
    });
  });
});
