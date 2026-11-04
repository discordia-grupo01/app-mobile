import { PUSH_DEVICE_REGISTER_FAILED } from "@discordia/client-shared";

import {
  ensureNotificationChannel,
  pushPlatform,
  readExpoPushToken,
} from "./device";
import {
  registerThisDevice,
  unregisterOnLogout,
  unregisterThisDevice,
} from "./registration";
import { registerPushDevice, unregisterPushDevice } from "./service";
import {
  clearPushDeviceId,
  readPushDeviceId,
  writePushDeviceId,
} from "./storage";

jest.mock("./device", () => ({
  ensureNotificationChannel: jest.fn(),
  pushPlatform: jest.fn(),
  readExpoPushToken: jest.fn(),
}));
jest.mock("./service", () => ({
  registerPushDevice: jest.fn(),
  unregisterPushDevice: jest.fn(),
}));
jest.mock("./storage", () => ({
  clearPushDeviceId: jest.fn(),
  readPushDeviceId: jest.fn(),
  writePushDeviceId: jest.fn(),
}));

const mockedChannel = ensureNotificationChannel as jest.Mock;
const mockedPlatform = pushPlatform as jest.Mock;
const mockedToken = readExpoPushToken as jest.Mock;
const mockedRegister = registerPushDevice as jest.Mock;
const mockedUnregister = unregisterPushDevice as jest.Mock;
const mockedClear = clearPushDeviceId as jest.Mock;
const mockedRead = readPushDeviceId as jest.Mock;
const mockedWrite = writePushDeviceId as jest.Mock;

beforeEach(() => {
  jest.resetAllMocks();
  mockedPlatform.mockReturnValue("android");
  mockedToken.mockResolvedValue("ExponentPushToken[abc]");
});

describe("registerThisDevice", () => {
  it("crea el canal, registra el token y recuerda el id del dispositivo", async () => {
    mockedRegister.mockResolvedValue({ ok: true, id: "dev1" });

    expect(await registerThisDevice("u1")).toEqual({ ok: true });

    expect(mockedChannel).toHaveBeenCalled();
    expect(mockedRegister).toHaveBeenCalledWith({
      provider: "expo",
      platform: "android",
      token: "ExponentPushToken[abc]",
    });
    expect(mockedWrite).toHaveBeenCalledWith("u1", "dev1");
  });

  it("registra en ios con la plataforma de ios", async () => {
    mockedPlatform.mockReturnValue("ios");
    mockedRegister.mockResolvedValue({ ok: true, id: "dev1" });

    await registerThisDevice("u1");

    expect(mockedRegister).toHaveBeenCalledWith(
      expect.objectContaining({ platform: "ios" }),
    );
  });

  it("si el back rechaza el dispositivo devuelve su mensaje y no guarda el id", async () => {
    mockedRegister.mockResolvedValue({
      ok: false,
      message: "Limite alcanzado",
      limitReached: true,
    });

    expect(await registerThisDevice("u1")).toEqual({
      ok: false,
      message: "Limite alcanzado",
    });
    expect(mockedWrite).not.toHaveBeenCalled();
  });

  it("un token que no tiene la forma de Expo no se manda", async () => {
    mockedToken.mockResolvedValue("no-es-un-token");

    expect(await registerThisDevice("u1")).toEqual({
      ok: false,
      message: PUSH_DEVICE_REGISTER_FAILED,
    });
    expect(mockedRegister).not.toHaveBeenCalled();
  });

  it("si Expo no entrega el token devuelve el error generico", async () => {
    mockedToken.mockRejectedValue(new Error("sin Google Play Services"));

    expect(await registerThisDevice("u1")).toEqual({
      ok: false,
      message: PUSH_DEVICE_REGISTER_FAILED,
    });
    expect(mockedRegister).not.toHaveBeenCalled();
  });

  it("si falla crear el canal devuelve el error generico", async () => {
    mockedChannel.mockRejectedValue(new Error("x"));

    expect(await registerThisDevice("u1")).toEqual({
      ok: false,
      message: PUSH_DEVICE_REGISTER_FAILED,
    });
  });
});

describe("unregisterThisDevice", () => {
  it("borra el dispositivo del back y su id local", async () => {
    mockedRead.mockResolvedValue("dev1");
    mockedUnregister.mockResolvedValue({ ok: true });

    expect(await unregisterThisDevice("u1")).toBe(true);

    expect(mockedUnregister).toHaveBeenCalledWith("dev1");
    expect(mockedClear).toHaveBeenCalledWith("u1");
  });

  it("si el back falla conserva el id para poder reintentar", async () => {
    mockedRead.mockResolvedValue("dev1");
    mockedUnregister.mockResolvedValue({ ok: false, message: "x" });

    expect(await unregisterThisDevice("u1")).toBe(false);
    expect(mockedClear).not.toHaveBeenCalled();
  });

  it("sin dispositivo registrado no hace nada", async () => {
    mockedRead.mockResolvedValue(null);

    expect(await unregisterThisDevice("u1")).toBe(true);
    expect(mockedUnregister).not.toHaveBeenCalled();
  });
});

describe("unregisterOnLogout", () => {
  it("nunca falla, aunque algo salga mal", async () => {
    mockedRead.mockResolvedValue("dev1");
    mockedUnregister.mockRejectedValue(new Error("sin red"));

    await expect(unregisterOnLogout("u1")).resolves.toBeUndefined();
  });
});
