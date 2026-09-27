import {
  type ApiFailure,
  messageFor,
  REQUEST_FAILED_MESSAGE,
  TWO_FACTOR_ACTIVATION_CODE_INVALID,
  TWO_FACTOR_ALREADY_ENABLED,
  TWO_FACTOR_CHALLENGE_EXPIRED,
  TWO_FACTOR_CODE_INVALID,
  TWO_FACTOR_NOT_ENABLED,
  TWO_FACTOR_PASSWORD_INVALID,
  TWO_FACTOR_PASSWORD_REQUIRED,
  TWO_FACTOR_SETUP_MISSING,
  TWO_FACTOR_TOO_MANY_ATTEMPTS,
  type TwoFactorDisableResult,
  type TwoFactorRecoveryCodesPayload,
  type TwoFactorRecoveryCodesResult,
  type TwoFactorSetup,
  type TwoFactorSetupResult,
  type TwoFactorStatus,
  type TwoFactorStatusResult,
  type TwoFactorVerifyPayload,
  type TwoFactorVerifyResultWithToken,
} from "@discordia/client-shared";

import { apiFetch } from "../../lib/api-client";

/**
 * Segundo factor contra identify-service.
 *
 * A diferencia de web-client no hay BFF en el medio: la app habla directo con
 * el backend, asi que el `challenge_token` lo sostiene la pantalla entre los
 * dos pasos del login.
 */

export async function getTwoFactorStatusService(): Promise<TwoFactorStatusResult> {
  const result = await apiFetch<TwoFactorStatus>("/v1/me/2fa", {
    method: "GET",
  });

  if (!result.ok) {
    return {
      ok: false,
      message: messageFor(result, {}, REQUEST_FAILED_MESSAGE),
    };
  }
  return { ok: true, status: result.data };
}

export async function startTwoFactorSetupService(): Promise<TwoFactorSetupResult> {
  const result = await apiFetch<TwoFactorSetup>("/v1/me/2fa/setup", {
    method: "POST",
  });

  if (!result.ok) {
    if (result.code === "PASSWORD_REQUIRED_FOR_TWO_FACTOR") {
      return {
        ok: false,
        message: TWO_FACTOR_PASSWORD_REQUIRED,
        passwordRequired: true,
      };
    }
    if (result.status === 409) {
      return { ok: false, message: TWO_FACTOR_ALREADY_ENABLED };
    }
    return {
      ok: false,
      message: messageFor(result, {}, REQUEST_FAILED_MESSAGE),
    };
  }
  return { ok: true, setup: result.data };
}

export async function activateTwoFactorService(
  code: string,
): Promise<TwoFactorRecoveryCodesResult> {
  const result = await apiFetch<TwoFactorRecoveryCodesPayload>(
    "/v1/me/2fa/activate",
    { method: "POST", body: JSON.stringify({ code: code.trim() }) },
  );

  if (!result.ok) {
    if (result.status === 400) {
      return { ok: false, message: TWO_FACTOR_ACTIVATION_CODE_INVALID };
    }
    if (result.status === 409) {
      return {
        ok: false,
        message:
          result.code === "TWO_FACTOR_ALREADY_ENABLED"
            ? TWO_FACTOR_ALREADY_ENABLED
            : TWO_FACTOR_SETUP_MISSING,
      };
    }
    return {
      ok: false,
      message: messageFor(result, {}, REQUEST_FAILED_MESSAGE),
    };
  }
  return { ok: true, recoveryCodes: result.data.recovery_codes };
}

export async function disableTwoFactorService(
  password: string,
): Promise<TwoFactorDisableResult> {
  const result = await apiFetch("/v1/me/2fa/disable", {
    method: "POST",
    body: JSON.stringify({ password }),
  });

  if (!result.ok) {
    return { ok: false, message: passwordEndpointMessage(result) };
  }
  return { ok: true };
}

export async function regenerateRecoveryCodesService(
  password: string,
): Promise<TwoFactorRecoveryCodesResult> {
  const result = await apiFetch<TwoFactorRecoveryCodesPayload>(
    "/v1/me/2fa/recovery-codes",
    { method: "POST", body: JSON.stringify({ password }) },
  );

  if (!result.ok) {
    return { ok: false, message: passwordEndpointMessage(result) };
  }
  return { ok: true, recoveryCodes: result.data.recovery_codes };
}

export async function verifyTwoFactorService(
  challengeToken: string,
  code: string,
): Promise<TwoFactorVerifyResultWithToken> {
  const result = await apiFetch<TwoFactorVerifyPayload>("/v1/login/2fa", {
    method: "POST",
    body: JSON.stringify({
      challenge_token: challengeToken,
      code: code.trim(),
    }),
  });

  if (!result.ok) {
    if (result.status === 429) {
      return {
        ok: false,
        message: TWO_FACTOR_TOO_MANY_ATTEMPTS,
        expired: true,
      };
    }
    if (result.status === 401) {
      if (result.code === "INVALID_TWO_FACTOR_CODE") {
        return { ok: false, message: TWO_FACTOR_CODE_INVALID };
      }
      return {
        ok: false,
        message: TWO_FACTOR_CHALLENGE_EXPIRED,
        expired: true,
      };
    }
    if (result.status === 400) {
      return { ok: false, message: TWO_FACTOR_CODE_INVALID };
    }
    return {
      ok: false,
      message: messageFor(result, {}, REQUEST_FAILED_MESSAGE),
    };
  }

  return {
    ok: true,
    user: result.data.user,
    token: result.data.token,
    recoveryCodeUsed: result.data.recovery_code_used ?? false,
    recoveryCodesRemaining: result.data.recovery_codes_remaining ?? 0,
  };
}

function passwordEndpointMessage(failure: ApiFailure): string {
  if (failure.status === 403) return TWO_FACTOR_PASSWORD_INVALID;
  if (failure.status === 409) return TWO_FACTOR_NOT_ENABLED;
  return messageFor(failure, {}, REQUEST_FAILED_MESSAGE);
}
