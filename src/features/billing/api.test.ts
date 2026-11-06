import {
  BILLING_ERROR_MESSAGES,
  NETWORK_ERROR_MESSAGE,
} from "@discordia/client-shared";

import { apiFetch } from "../../lib/api-client";

import {
  getPremium,
  getPurchase,
  startPointsCheckout,
  startPremiumCheckout,
} from "./api";
import { BILLING_EXTRA_ERROR_MESSAGES } from "./billingCopy";

jest.mock("../../lib/api-client", () => ({ apiFetch: jest.fn() }));

const mockedFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

beforeEach(() => mockedFetch.mockReset());

function failWith(status: number, code: string) {
  mockedFetch.mockResolvedValue({ ok: false, status, code, message: "x" });
}

describe("checkouts", () => {
  it("manda la Idempotency-Key en el checkout de puntos", async () => {
    mockedFetch.mockResolvedValue({
      ok: true,
      status: 201,
      data: { purchase_id: "p1", checkout_url: "https://mp/1" },
    });

    const result = await startPointsCheckout({ package_id: "pack" }, "k1");

    expect(mockedFetch).toHaveBeenCalledWith("/v1/billing/points/checkout", {
      method: "POST",
      headers: { "Idempotency-Key": "k1" },
      body: JSON.stringify({ package_id: "pack", return_to: "app" }),
    });
    expect(result).toEqual({
      ok: true,
      data: { purchase_id: "p1", checkout_url: "https://mp/1" },
    });
  });

  it("manda la Idempotency-Key en el checkout de Premium", async () => {
    mockedFetch.mockResolvedValue({
      ok: true,
      status: 201,
      data: { checkout_url: "https://mp/2" },
    });

    await startPremiumCheckout({ payer_email: "a@b.com" }, "k2");

    expect(mockedFetch).toHaveBeenCalledWith("/v1/billing/premium/checkout", {
      method: "POST",
      headers: { "Idempotency-Key": "k2" },
      body: JSON.stringify({ payer_email: "a@b.com", return_to: "app" }),
    });
  });

  it("traduce ALREADY_SUBSCRIBED con el texto de client-shared", async () => {
    failWith(409, "ALREADY_SUBSCRIBED");

    expect(await startPremiumCheckout({}, "k")).toEqual({
      ok: false,
      code: "ALREADY_SUBSCRIBED",
      message: BILLING_ERROR_MESSAGES.ALREADY_SUBSCRIBED,
    });
  });

  it("traduce los códigos nuevos de idempotencia", async () => {
    failWith(409, "CHECKOUT_IN_PROGRESS");
    const inProgress = await startPointsCheckout({ package_id: "p" }, "k");
    failWith(422, "IDEMPOTENCY_KEY_REUSED");
    const reused = await startPointsCheckout({ package_id: "p" }, "k");

    expect(inProgress).toMatchObject({
      message: BILLING_EXTRA_ERROR_MESSAGES.CHECKOUT_IN_PROGRESS,
    });
    expect(reused).toMatchObject({
      message: BILLING_EXTRA_ERROR_MESSAGES.IDEMPOTENCY_KEY_REUSED,
    });
  });

  it("sin red muestra el mensaje de conexión", async () => {
    mockedFetch.mockResolvedValue({
      ok: false,
      status: 0,
      code: "NETWORK_ERROR",
      message: NETWORK_ERROR_MESSAGE,
    });

    expect(await startPointsCheckout({ package_id: "p" }, "k")).toMatchObject({
      ok: false,
      message: NETWORK_ERROR_MESSAGE,
    });
  });
});

describe("consultas", () => {
  it("getPremium con refresh agrega ?refresh=1", async () => {
    mockedFetch.mockResolvedValue({ ok: true, status: 200, data: {} });

    await getPremium({ refresh: true });

    expect(mockedFetch).toHaveBeenCalledWith("/v1/billing/premium?refresh=1", {
      method: "GET",
    });
  });

  it("getPurchase escapa el id", async () => {
    mockedFetch.mockResolvedValue({ ok: true, status: 200, data: {} });

    await getPurchase("a/b");

    expect(mockedFetch).toHaveBeenCalledWith("/v1/billing/purchases/a%2Fb", {
      method: "GET",
    });
  });
});
