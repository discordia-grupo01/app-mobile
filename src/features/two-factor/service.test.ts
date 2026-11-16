import {
  ACCOUNT_RECOVERY_CHALLENGE_EXPIRED,
  ACCOUNT_RECOVERY_UNAVAILABLE,
  ACCOUNT_SUSPENDED_MESSAGE,
} from "@discordia/client-shared";

import { apiFetch } from "../../lib/api-client";

import { requestAccountRecoveryService } from "./service";

jest.mock("../../lib/api-client", () => ({ apiFetch: jest.fn() }));

const mockedFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

const failure = (status: number, code = "X") => ({
  ok: false as const,
  status,
  code,
  message: "x",
});

beforeEach(() => mockedFetch.mockReset());

describe("requestAccountRecoveryService", () => {
  it("manda el challenge con el mensaje recortado y devuelve el email enmascarado", async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      data: {
        request_id: "r-1",
        status: "pending",
        email_hint: "a***a@gmail.com",
      },
    });

    const result = await requestAccountRecoveryService(
      "challenge-123",
      "  perdí el celular  ",
    );

    expect(mockedFetch).toHaveBeenCalledWith("/v1/login/2fa/recovery-request", {
      method: "POST",
      body: JSON.stringify({
        challenge_token: "challenge-123",
        message: "perdí el celular",
      }),
    });
    expect(result).toEqual({ ok: true, emailHint: "a***a@gmail.com" });
  });

  it("si ya hay una pendiente lo informa como resultado, no como error", async () => {
    mockedFetch.mockResolvedValueOnce(
      failure(409, "ACCOUNT_RECOVERY_ALREADY_PENDING"),
    );

    expect(await requestAccountRecoveryService("c", "")).toEqual({
      ok: true,
      alreadyPending: true,
    });
  });

  it("con el challenge vencido avisa que hay que volver a iniciar sesión", async () => {
    mockedFetch.mockResolvedValueOnce(
      failure(401, "TWO_FACTOR_CHALLENGE_EXPIRED"),
    );

    expect(await requestAccountRecoveryService("c", "")).toEqual({
      ok: false,
      message: ACCOUNT_RECOVERY_CHALLENGE_EXPIRED,
      expired: true,
    });
  });

  it("con la cuenta suspendida muestra el aviso de suspensión", async () => {
    mockedFetch.mockResolvedValueOnce(failure(403, "ACCOUNT_SUSPENDED"));

    expect(await requestAccountRecoveryService("c", "")).toEqual({
      ok: false,
      message: ACCOUNT_SUSPENDED_MESSAGE,
    });
  });

  it("si falla el servicio o la red deja reintentar", async () => {
    mockedFetch.mockResolvedValueOnce(failure(0));

    expect(await requestAccountRecoveryService("c", "")).toEqual({
      ok: false,
      message: ACCOUNT_RECOVERY_UNAVAILABLE,
    });
  });
});
