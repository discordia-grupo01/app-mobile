import {
  CHANNEL_OVERRIDE_REASONS,
  MEMBER_PERMISSIONS_LOAD_FAILED,
  OWNER_ONLY_OVERRIDE_CHANNEL_PERMISSIONS,
  SESSION_EXPIRED_MESSAGE,
} from "@discordia/client-shared";

import { apiFetch } from "../../../lib/api-client";

import {
  deleteChannelOverride,
  getMemberChannelPermissions,
  listChannelOverrides,
  setChannelOverride,
} from "./channel-permissions";

jest.mock("../../../lib/api-client", () => ({ apiFetch: jest.fn() }));

const mockedFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

function failure(status: number, details?: Record<string, unknown>) {
  return {
    ok: false as const,
    status,
    code: "ERR",
    message: "x",
    details,
  };
}

const override = {
  channel_id: "c1",
  role_id: "r1",
  allow: ["SEND_MESSAGES" as const],
  deny: [],
  updated_at: "2026-10-01T00:00:00Z",
};

beforeEach(() => mockedFetch.mockReset());

describe("listChannelOverrides", () => {
  it("devuelve las excepciones del canal", async () => {
    mockedFetch.mockResolvedValue({ ok: true, status: 200, data: [override] });

    expect(await listChannelOverrides("c1")).toEqual({
      ok: true,
      overrides: [override],
    });
    expect(mockedFetch).toHaveBeenCalledWith("/v1/channels/c1/permissions", {
      method: "GET",
    });
  });

  it("con la sesion vencida avisa que hay que volver a entrar", async () => {
    mockedFetch.mockResolvedValue(failure(401));

    expect(await listChannelOverrides("c1")).toEqual({
      ok: false,
      message: SESSION_EXPIRED_MESSAGE,
    });
  });
});

describe("setChannelOverride", () => {
  it("manda allow y deny al rol en la URL", async () => {
    mockedFetch.mockResolvedValue({ ok: true, status: 200, data: override });

    const result = await setChannelOverride("c1", "r1", {
      allow: ["SEND_MESSAGES"],
      deny: ["ADD_REACTIONS"],
    });

    expect(result).toEqual({ ok: true, override });
    expect(mockedFetch).toHaveBeenCalledWith(
      "/v1/channels/c1/permissions/roles/r1",
      {
        method: "PUT",
        body: JSON.stringify({
          allow: ["SEND_MESSAGES"],
          deny: ["ADD_REACTIONS"],
        }),
      },
    );
  });

  it("un 204 (sin excepcion) vuelve con override null", async () => {
    mockedFetch.mockResolvedValue({ ok: true, status: 204, data: null });

    expect(
      await setChannelOverride("c1", "r1", { allow: [], deny: [] }),
    ).toEqual({ ok: true, override: null });
  });

  it("traduce role_above_own", async () => {
    mockedFetch.mockResolvedValue(failure(403, { reason: "role_above_own" }));

    expect(
      await setChannelOverride("c1", "r1", { allow: [], deny: ["CONNECT"] }),
    ).toEqual({ ok: false, message: CHANNEL_OVERRIDE_REASONS.role_above_own });
  });

  it("permission_not_held nombra el permiso que falta", async () => {
    mockedFetch.mockResolvedValue(
      failure(403, {
        reason: "permission_not_held",
        permissions: ["SEND_MESSAGES"],
      }),
    );

    const result = await setChannelOverride("c1", "r1", {
      allow: ["SEND_MESSAGES"],
      deny: [],
    });

    expect(result.ok).toBe(false);
    expect(result.ok ? null : result.message).toMatch(/enviar mensajes/i);
    expect(result.ok ? null : result.permissionDenied).toBeUndefined();
  });

  it("un 403 sin reason es que falta MANAGE_ROLES", async () => {
    mockedFetch.mockResolvedValue(failure(403));

    expect(
      await setChannelOverride("c1", "r1", { allow: [], deny: [] }),
    ).toEqual({
      ok: false,
      message: OWNER_ONLY_OVERRIDE_CHANNEL_PERMISSIONS,
      permissionDenied: true,
    });
  });
});

describe("deleteChannelOverride", () => {
  it("borra la excepcion del rol", async () => {
    mockedFetch.mockResolvedValue({ ok: true, status: 204, data: undefined });

    expect(await deleteChannelOverride("c1", "r1")).toEqual({ ok: true });
    expect(mockedFetch).toHaveBeenCalledWith(
      "/v1/channels/c1/permissions/roles/r1",
      { method: "DELETE" },
    );
  });

  it("si ya no existia la da por borrada", async () => {
    mockedFetch.mockResolvedValue(
      failure(404, { reason: "channel_override_not_found" }),
    );

    expect(await deleteChannelOverride("c1", "r1")).toEqual({ ok: true });
  });
});

describe("getMemberChannelPermissions", () => {
  it("devuelve los permisos efectivos en el canal", async () => {
    mockedFetch.mockResolvedValue({
      ok: true,
      status: 200,
      data: { channel_id: "c1", user_id: "u1", permissions: ["VIEW_CHANNELS"] },
    });

    expect(await getMemberChannelPermissions("c1", "u1")).toEqual({
      ok: true,
      permissions: ["VIEW_CHANNELS"],
    });
    expect(mockedFetch).toHaveBeenCalledWith(
      "/v1/channels/c1/members/u1/permissions",
      { method: "GET" },
    );
  });

  it("si falla usa el texto generico", async () => {
    mockedFetch.mockResolvedValue(failure(500));

    expect(await getMemberChannelPermissions("c1", "u1")).toEqual({
      ok: false,
      message: MEMBER_PERMISSIONS_LOAD_FAILED,
    });
  });
});
