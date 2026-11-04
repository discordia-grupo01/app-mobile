import {
  PUSH_DEVICE_LIMIT_REACHED,
  PUSH_DEVICE_REGISTER_FAILED,
  PUSH_DEVICE_UNREGISTER_FAILED,
  PUSH_SETTINGS_LOAD_FAILED,
  PUSH_SETTINGS_SAVE_FAILED,
} from "@discordia/client-shared";

import { apiFetch } from "../../lib/api-client";

import {
  getPushSettings,
  registerPushDevice,
  unregisterPushDevice,
  updatePushSettings,
} from "./service";

jest.mock("../../lib/api-client", () => ({ apiFetch: jest.fn() }));

const mockedFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

const failure = (status: number) => ({
  ok: false as const,
  status,
  code: status,
  message: "x",
});

const DEVICE = {
  provider: "expo" as const,
  platform: "android" as const,
  token: "ExponentPushToken[abc]",
};

beforeEach(() => mockedFetch.mockReset());

describe("getPushSettings", () => {
  it("devuelve si el usuario recibe push", async () => {
    mockedFetch.mockResolvedValue({
      ok: true,
      status: 200,
      data: { enabled: false },
    });

    expect(await getPushSettings()).toEqual({ ok: true, enabled: false });
    expect(mockedFetch).toHaveBeenCalledWith(
      "/v1/notifications/push/settings",
      {
        method: "GET",
      },
    );
  });

  it("si falla devuelve el mensaje de siempre", async () => {
    mockedFetch.mockResolvedValue(failure(503));

    expect(await getPushSettings()).toEqual({
      ok: false,
      message: PUSH_SETTINGS_LOAD_FAILED,
    });
  });
});

describe("updatePushSettings", () => {
  it("manda el interruptor en el cuerpo y devuelve el estado resultante", async () => {
    mockedFetch.mockResolvedValue({
      ok: true,
      status: 200,
      data: { enabled: true },
    });

    expect(await updatePushSettings(true)).toEqual({ ok: true, enabled: true });
    expect(mockedFetch).toHaveBeenCalledWith(
      "/v1/notifications/push/settings",
      {
        method: "PUT",
        body: JSON.stringify({ enabled: true }),
      },
    );
  });

  it("si falla devuelve el mensaje de guardado", async () => {
    mockedFetch.mockResolvedValue(failure(400));

    expect(await updatePushSettings(false)).toEqual({
      ok: false,
      message: PUSH_SETTINGS_SAVE_FAILED,
    });
  });
});

describe("registerPushDevice", () => {
  it("registra el dispositivo con el token en el cuerpo, no en la URL", async () => {
    mockedFetch.mockResolvedValue({
      ok: true,
      status: 201,
      data: { id: "dev1" },
    });

    expect(await registerPushDevice(DEVICE)).toEqual({ ok: true, id: "dev1" });
    expect(mockedFetch).toHaveBeenCalledWith("/v1/notifications/push/devices", {
      method: "POST",
      body: JSON.stringify(DEVICE),
    });
  });

  it("avisa cuando se alcanzo el maximo de dispositivos", async () => {
    mockedFetch.mockResolvedValue(failure(409));

    expect(await registerPushDevice(DEVICE)).toEqual({
      ok: false,
      message: PUSH_DEVICE_LIMIT_REACHED,
      limitReached: true,
    });
  });

  it("cualquier otro fallo devuelve el mensaje de siempre", async () => {
    mockedFetch.mockResolvedValue(failure(503));

    expect(await registerPushDevice(DEVICE)).toEqual({
      ok: false,
      message: PUSH_DEVICE_REGISTER_FAILED,
    });
  });
});

describe("unregisterPushDevice", () => {
  it("borra el dispositivo por su id", async () => {
    mockedFetch.mockResolvedValue({ ok: true, status: 204, data: undefined });

    expect(await unregisterPushDevice("dev 1")).toEqual({ ok: true });
    expect(mockedFetch).toHaveBeenCalledWith(
      "/v1/notifications/push/devices/dev%201",
      { method: "DELETE" },
    );
  });

  it("si falla devuelve el mensaje de siempre", async () => {
    mockedFetch.mockResolvedValue(failure(503));

    expect(await unregisterPushDevice("dev1")).toEqual({
      ok: false,
      message: PUSH_DEVICE_UNREGISTER_FAILED,
    });
  });
});
