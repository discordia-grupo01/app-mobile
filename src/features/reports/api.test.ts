import { apiFetch } from "../../lib/api-client";

import {
  closeReport,
  createReport,
  deleteReportedMessage,
  fetchPendingReportsCount,
} from "./api";

jest.mock("../../lib/api-client", () => ({ apiFetch: jest.fn() }));

const mockedFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

beforeEach(() => mockedFetch.mockReset());

describe("fetchPendingReportsCount", () => {
  it("sin los tres permisos devuelve 0 sin pedir los reportes", async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: { permissions: ["MANAGE_MESSAGES", "KICK_MEMBERS"] },
    });

    expect(await fetchPendingReportsCount("s1", "u1")).toBe(0);
    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(mockedFetch).toHaveBeenCalledWith(
      "/v1/servers/s1/members/u1/permissions",
      { method: "GET" },
    );
  });

  it("siendo moderador devuelve el total de pendientes", async () => {
    mockedFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        data: {
          permissions: ["MANAGE_MESSAGES", "KICK_MEMBERS", "BAN_MEMBERS"],
        },
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        data: { reports: [], total: 4, limit: 1, offset: 0 },
      });

    expect(await fetchPendingReportsCount("s1", "u1")).toBe(4);
    expect(mockedFetch).toHaveBeenLastCalledWith(
      "/v1/servers/s1/reports?status=pending&limit=1&offset=0",
      { method: "GET" },
    );
  });

  it("si fallan los permisos devuelve null (se conserva lo anterior)", async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: false,
      status: 502,
      code: 502,
      message: "x",
    });

    expect(await fetchPendingReportsCount("s1", "u1")).toBeNull();
  });
});

describe("closeReport", () => {
  it("manda la accion solo si la hay", async () => {
    mockedFetch.mockResolvedValue({ ok: true, status: 200, data: {} });

    await closeReport("s1", "r1", "resolved", "mute");
    await closeReport("s1", "r1", "dismissed");

    expect(mockedFetch).toHaveBeenNthCalledWith(
      1,
      "/v1/servers/s1/reports/r1",
      {
        method: "PATCH",
        body: JSON.stringify({ status: "resolved", action: "mute" }),
      },
    );
    expect(mockedFetch).toHaveBeenNthCalledWith(
      2,
      "/v1/servers/s1/reports/r1",
      {
        method: "PATCH",
        body: JSON.stringify({ status: "dismissed" }),
      },
    );
  });

  it("un 409 marca el reporte como ya cerrado", async () => {
    mockedFetch.mockResolvedValue({
      ok: false,
      status: 409,
      code: 409,
      message: "x",
      details: { reason: "report_not_pending" },
    });

    const result = await closeReport("s1", "r1", "resolved");

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.isGone).toBe(true);
  });
});

describe("createReport", () => {
  it("manda el cuerpo en snake_case", async () => {
    mockedFetch.mockResolvedValue({
      ok: true,
      status: 201,
      data: { id: "r1" },
    });

    await createReport("s1", {
      kind: "message",
      channelId: "c1",
      messageId: "m1",
      reason: "Spam",
    });

    expect(mockedFetch).toHaveBeenCalledWith("/v1/servers/s1/reports", {
      method: "POST",
      body: JSON.stringify({
        kind: "message",
        channel_id: "c1",
        message_id: "m1",
        reason: "Spam",
      }),
    });
  });
});

describe("deleteReportedMessage", () => {
  it("borra por REST", async () => {
    mockedFetch.mockResolvedValue({ ok: true, status: 204, data: undefined });

    expect(await deleteReportedMessage("c1", "m1")).toEqual({ ok: true });
    expect(mockedFetch).toHaveBeenCalledWith("/v1/channels/c1/messages/m1", {
      method: "DELETE",
    });
  });
});
