import {
  type ModerationAuditEntry,
  NO_PERMISSION_MODERATION_AUDIT,
} from "@discordia/client-shared";

import { apiFetch } from "../../lib/api-client";

import { listModerationAudit } from "./api";

jest.mock("../../lib/api-client", () => ({ apiFetch: jest.fn() }));

const mockedFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

beforeEach(() => mockedFetch.mockReset());

describe("listModerationAudit", () => {
  it("pide la pagina con limit y offset y devuelve las entradas con el total", async () => {
    const entry = { id: "a1", action: "kick" } as ModerationAuditEntry;
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: { entries: [entry], total: 45, limit: 15, offset: 15 },
    });

    expect(await listModerationAudit("s1", { limit: 15, offset: 15 })).toEqual({
      ok: true,
      entries: [entry],
      total: 45,
    });
    expect(mockedFetch).toHaveBeenCalledWith(
      "/v1/servers/s1/moderation-audit?limit=15&offset=15",
      { method: "GET" },
    );
  });

  it("un 403 es falta de permiso", async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      code: 403,
      message: "",
    });

    expect(await listModerationAudit("s1", { limit: 15, offset: 0 })).toEqual({
      ok: false,
      message: NO_PERMISSION_MODERATION_AUDIT,
    });
  });
});
