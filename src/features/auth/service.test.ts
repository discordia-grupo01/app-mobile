import {
  CURRENT_PASSWORD_INVALID,
  PASSWORD_NOT_SET,
} from "@discordia/client-shared";

import { apiFetch } from "../../lib/api-client";

import { changePasswordService } from "./service";

jest.mock("../../lib/api-client", () => ({ apiFetch: jest.fn() }));
jest.mock("../../lib/device-id", () => ({ getOrCreateDeviceId: jest.fn() }));

const mockedFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

const values = {
  currentPassword: "Actual123",
  newPassword: "Nueva1234",
  confirmPassword: "Nueva1234",
};

const failure = (status: number, code: string) => ({
  ok: false as const,
  status,
  code,
  message: "x",
});

beforeEach(() => mockedFetch.mockReset());

describe("changePasswordService", () => {
  it("manda los tres campos con los nombres del back", async () => {
    mockedFetch.mockResolvedValueOnce({ ok: true, status: 204, data: null });

    const result = await changePasswordService(values);

    expect(mockedFetch).toHaveBeenCalledWith("/v1/me/password", {
      method: "PUT",
      body: JSON.stringify({
        current_password: "Actual123",
        new_password: "Nueva1234",
        confirm_password: "Nueva1234",
      }),
    });
    expect(result).toEqual({ ok: true });
  });

  it("trata el 403 como contraseña actual incorrecta", async () => {
    mockedFetch.mockResolvedValueOnce(failure(403, "INVALID_PASSWORD"));

    expect(await changePasswordService(values)).toEqual({
      ok: false,
      message: CURRENT_PASSWORD_INVALID,
    });
  });

  it("marca la cuenta sin contraseña", async () => {
    mockedFetch.mockResolvedValueOnce(failure(409, "PASSWORD_NOT_SET"));

    expect(await changePasswordService(values)).toEqual({
      ok: false,
      message: PASSWORD_NOT_SET,
      passwordNotSet: true,
    });
  });
});
