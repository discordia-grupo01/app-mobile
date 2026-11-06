import type { PointPurchase, PremiumView } from "@discordia/client-shared";

import { checkPaymentStep, type PaymentStatusApi } from "./paymentResult";

const purchase = (status: PointPurchase["status"]): PointPurchase => ({
  id: "p1",
  package_id: "pack",
  points: 500,
  price_cents: 100,
  status,
  status_detail: "",
  points_unrecovered: 0,
  created_at: "2026-11-05T00:00:00Z",
  updated_at: "2026-11-05T00:00:00Z",
});

const premium = (state: PremiumView["state"]): PremiumView => ({
  state,
  active: state === "active",
  premium_until: null,
  renews: true,
  mp_status: "authorized",
});

function api(overrides: Partial<PaymentStatusApi> = {}): PaymentStatusApi {
  return {
    getPurchase: jest
      .fn()
      .mockResolvedValue({ ok: true, data: purchase("pending") }),
    getPointsOverview: jest.fn().mockResolvedValue({
      ok: true,
      data: { balance: 1200, ledger: [], purchases: [] },
    }),
    getPremium: jest
      .fn()
      .mockResolvedValue({ ok: true, data: premium("none") }),
    ...overrides,
  };
}

describe("checkPaymentStep", () => {
  it("compra pagada: acreditada y con el saldo nuevo", async () => {
    const a = api({
      getPurchase: jest
        .fn()
        .mockResolvedValue({ ok: true, data: purchase("paid") }),
    });

    const step = await checkPaymentStep(
      { kind: "points", purchaseId: "p1" },
      0,
      a,
    );

    expect(step).toMatchObject({
      kind: "progress",
      state: {
        progress: { outcome: "points_accredited", done: true },
        balance: 1200,
      },
    });
  });

  it("compra pendiente: sigue verificando", async () => {
    const step = await checkPaymentStep(
      { kind: "points", purchaseId: "p1" },
      0,
      api(),
    );

    expect(step).toMatchObject({
      state: { progress: { outcome: "verifying", done: false } },
    });
  });

  it("compra que no existe: termina en no encontrada", async () => {
    const a = api({
      getPurchase: jest.fn().mockResolvedValue({
        ok: false,
        code: "PURCHASE_NOT_FOUND",
        message: "",
      }),
    });

    const step = await checkPaymentStep(
      { kind: "points", purchaseId: "p1" },
      0,
      a,
    );

    expect(step).toMatchObject({
      state: { progress: { outcome: "points_not_found", done: true } },
    });
  });

  it("un error de red se informa como fallo para reintentar", async () => {
    const a = api({
      getPurchase: jest
        .fn()
        .mockResolvedValue({ ok: false, code: "NETWORK_ERROR", message: "" }),
    });

    expect(
      await checkPaymentStep({ kind: "points", purchaseId: "p1" }, 0, a),
    ).toEqual({ kind: "failed" });
  });

  it("Premium consulta con refresh y detecta la activación", async () => {
    const getPremium = jest
      .fn()
      .mockResolvedValue({ ok: true, data: premium("active") });

    const step = await checkPaymentStep(
      { kind: "premium", purchaseId: null },
      0,
      api({ getPremium }),
    );

    expect(getPremium).toHaveBeenCalledWith({ refresh: true });
    expect(step).toMatchObject({
      state: { progress: { outcome: "premium_active", done: true } },
    });
  });
});
