import {
  billingErrorMessage,
  BOOSTS_LIST_MAX_LIMIT,
  BOOSTS_LOAD_ERROR,
} from "@discordia/client-shared";

import { apiFetch } from "../../lib/api-client";

import {
  getBoost,
  getServerBoostSummary,
  listOwnBoosts,
  removeBoost,
  requestBoost,
} from "./api";

jest.mock("../../lib/api-client", () => ({ apiFetch: jest.fn() }));

const mockedFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

beforeEach(() => mockedFetch.mockReset());

describe("getServerBoostSummary", () => {
  it("pide el resumen del servidor y lo normaliza", async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: {
        boost_count: 7,
        level: 1,
        perks_unlocked: ["extra_emoji_slots", "animated_icon"],
        next_level: { level: 2, boosts_required: 15, boosts_missing: 8 },
      },
    });

    expect(await getServerBoostSummary("s1")).toEqual({
      ok: true,
      summary: {
        boost_count: 7,
        level: 1,
        perks_unlocked: ["extra_emoji_slots", "animated_icon"],
        next_level: { level: 2, boosts_required: 15, boosts_missing: 8 },
      },
    });
    expect(mockedFetch).toHaveBeenCalledWith("/v1/servers/s1/boosts", {
      method: "GET",
    });
  });

  it("si el back falla, devuelve el texto de error de boosts", async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      code: 403,
      message: "forbidden",
    });

    expect(await getServerBoostSummary("s1")).toEqual({
      ok: false,
      message: BOOSTS_LOAD_ERROR,
    });
  });
});

const pendingBoost = {
  id: "b1",
  server_id: "s1",
  points: 100,
  status: "pending",
  status_detail: "",
  created_at: "2026-11-14T12:00:00Z",
  updated_at: "2026-11-14T12:00:00Z",
};

describe("requestBoost", () => {
  it("manda el servidor y la Idempotency-Key", async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      status: 202,
      data: pendingBoost,
    });

    expect(await requestBoost("s1", "k1")).toEqual({
      ok: true,
      data: pendingBoost,
    });
    expect(mockedFetch).toHaveBeenCalledWith("/v1/billing/boosts", {
      method: "POST",
      headers: { "Idempotency-Key": "k1" },
      body: JSON.stringify({ server_id: "s1" }),
    });
  });

  it("si no alcanzan los puntos dice cuántos faltan", async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: false,
      status: 409,
      code: "INSUFFICIENT_POINTS",
      message: "insufficient points",
      details: { balance: 40, cost: 100, missing: 60 },
    });

    expect(await requestBoost("s1", "k1")).toEqual({
      ok: false,
      code: "INSUFFICIENT_POINTS",
      message: billingErrorMessage("INSUFFICIENT_POINTS", { missing: 60 }),
    });
  });
});

describe("listOwnBoosts", () => {
  it("pide el máximo y devuelve la lista", async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: { boosts: [pendingBoost] },
    });

    expect(await listOwnBoosts()).toEqual({ ok: true, data: [pendingBoost] });
    expect(mockedFetch).toHaveBeenCalledWith(
      `/v1/billing/boosts?limit=${BOOSTS_LIST_MAX_LIMIT}`,
      { method: "GET" },
    );
  });
});

describe("getBoost y removeBoost", () => {
  it("usan la ruta del boost", async () => {
    mockedFetch.mockResolvedValue({
      ok: true,
      status: 200,
      data: pendingBoost,
    });

    await getBoost("b/1");
    await removeBoost("b1");

    expect(mockedFetch).toHaveBeenNthCalledWith(1, "/v1/billing/boosts/b%2F1", {
      method: "GET",
    });
    expect(mockedFetch).toHaveBeenNthCalledWith(2, "/v1/billing/boosts/b1", {
      method: "DELETE",
    });
  });
});
