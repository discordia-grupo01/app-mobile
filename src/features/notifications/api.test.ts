import {
  NOTIFICATION_SETTINGS_LOAD_FAILED,
  NOTIFICATION_SETTINGS_SAVE_FAILED,
} from "@discordia/client-shared";

import { apiFetch } from "../../lib/api-client";

import {
  listNotificationSettings,
  updateChannelNotificationSettings,
  updateServerNotificationSettings,
} from "./api";

jest.mock("../../lib/api-client", () => ({ apiFetch: jest.fn() }));

const mockedFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

beforeEach(() => mockedFetch.mockReset());

const LISTING = {
  servers: ["s1"],
  channels: [{ channel_id: "c1", server_id: "s1" }],
  preferences: {
    servers: [{ server_id: "s2", level: "all" }],
    channels: [],
  },
};

describe("listNotificationSettings", () => {
  it("pide la configuración y la devuelve tal cual", async () => {
    mockedFetch.mockResolvedValue({ ok: true, status: 200, data: LISTING });

    const result = await listNotificationSettings();

    expect(mockedFetch).toHaveBeenCalledWith("/v1/notifications/settings", {
      method: "GET",
    });
    expect(result).toEqual({ ok: true, ...LISTING });
  });

  it("con una respuesta incompleta devuelve el error de carga", async () => {
    mockedFetch.mockResolvedValue({
      ok: true,
      status: 200,
      data: { servers: [] },
    });

    expect(await listNotificationSettings()).toEqual({
      ok: false,
      message: NOTIFICATION_SETTINGS_LOAD_FAILED,
    });
  });

  it("si el servicio falla devuelve el error de carga", async () => {
    mockedFetch.mockResolvedValue({
      ok: false,
      status: 503,
      code: "SETTINGS_UNAVAILABLE",
      message: "x",
    });

    expect(await listNotificationSettings()).toEqual({
      ok: false,
      message: NOTIFICATION_SETTINGS_LOAD_FAILED,
    });
  });
});

describe("guardar configuración", () => {
  it("canal: PUT con el cambio y devuelve el estado resultante", async () => {
    mockedFetch.mockResolvedValue({
      ok: true,
      status: 200,
      data: { channel_id: "c/1", muted: true, level: null },
    });

    const result = await updateChannelNotificationSettings("c/1", {
      muted: true,
    });

    expect(mockedFetch).toHaveBeenCalledWith(
      "/v1/notifications/settings/channels/c%2F1",
      { method: "PUT", body: JSON.stringify({ muted: true }) },
    );
    expect(result).toEqual({ ok: true, muted: true, level: null });
  });

  it("servidor: manda el nivel", async () => {
    mockedFetch.mockResolvedValue({
      ok: true,
      status: 200,
      data: { server_id: "s1", muted: false, level: "none" },
    });

    const result = await updateServerNotificationSettings("s1", {
      level: "none",
    });

    expect(mockedFetch).toHaveBeenCalledWith(
      "/v1/notifications/settings/servers/s1",
      { method: "PUT", body: JSON.stringify({ level: "none" }) },
    );
    expect(result).toEqual({ ok: true, muted: false, level: "none" });
  });

  it("un rechazo del back devuelve el texto de error de guardado", async () => {
    mockedFetch.mockResolvedValue({
      ok: false,
      status: 403,
      code: "FORBIDDEN",
      message: "x",
    });

    expect(
      await updateChannelNotificationSettings("c1", { level: "all" }),
    ).toEqual({ ok: false, message: NOTIFICATION_SETTINGS_SAVE_FAILED });
  });
});
