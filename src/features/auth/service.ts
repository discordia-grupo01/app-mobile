import {
  type AuthResponse,
  EMAIL_ALREADY_REGISTERED,
  type ForgotPasswordResult,
  GOOGLE_UNAVAILABLE,
  GOOGLE_VERIFY_FAILED,
  INVALID_CREDENTIALS,
  INVALID_DATA_MESSAGE,
  INVALID_EMAIL_MESSAGE,
  type LoginResultWithToken,
  type LoginValues,
  messageFor,
  type PublicUser,
  RATE_LIMITED_MESSAGE,
  type RegisterResult,
  type RegisterValues,
  REQUEST_FAILED_MESSAGE,
  type User,
} from "@discordia/client-shared";

import { apiFetch } from "../../lib/api-client";

export async function registerService(
  values: RegisterValues,
): Promise<RegisterResult> {
  const result = await apiFetch<User>("/v1/users", {
    method: "POST",
    body: JSON.stringify({
      name: values.name.trim(),
      email: values.email.trim(),
      password: values.password,
    }),
  });

  if (!result.ok) {
    if (result.status === 409) {
      return { ok: false, message: EMAIL_ALREADY_REGISTERED };
    }
    if (result.status === 400) {
      return { ok: false, message: INVALID_DATA_MESSAGE };
    }
    return {
      ok: false,
      message: messageFor(result, {}, REQUEST_FAILED_MESSAGE),
    };
  }

  return { ok: true };
}

export async function loginService(
  credentials: LoginValues,
): Promise<LoginResultWithToken> {
  const result = await apiFetch<AuthResponse>("/v1/login", {
    method: "POST",
    body: JSON.stringify({
      email: credentials.email.trim(),
      password: credentials.password,
    }),
  });

  if (!result.ok) {
    if (result.status === 401 || result.status === 400) {
      return { ok: false, message: INVALID_CREDENTIALS };
    }
    return {
      ok: false,
      message: messageFor(result, {}, REQUEST_FAILED_MESSAGE),
    };
  }

  return { ok: true, user: result.data.user, token: result.data.token };
}

export async function loginWithGoogleService(
  idToken: string,
): Promise<LoginResultWithToken> {
  const result = await apiFetch<AuthResponse>("/v1/oauth/google", {
    method: "POST",
    body: JSON.stringify({ id_token: idToken }),
  });

  if (!result.ok) {
    if (result.status === 503) {
      return {
        ok: false,
        message: GOOGLE_UNAVAILABLE,
      };
    }
    return {
      ok: false,
      message: messageFor(result, {}, GOOGLE_VERIFY_FAILED),
    };
  }

  return { ok: true, user: result.data.user, token: result.data.token };
}

export async function logoutService(): Promise<void> {
  await apiFetch("/v1/logout", { method: "POST" });
}

export async function getPublicUser(
  userId: string,
): Promise<PublicUser | null> {
  const result = await apiFetch<PublicUser>(`/v1/users/${userId}`, {
    method: "GET",
  });
  return result.ok ? result.data : null;
}

export async function forgotPasswordService(
  email: string,
): Promise<ForgotPasswordResult> {
  const result = await apiFetch<{ message: string }>("/v1/password-recovery", {
    method: "POST",
    body: JSON.stringify({ email: email.trim() }),
  });

  if (!result.ok) {
    if (result.status === 429) {
      return {
        ok: false,
        message: RATE_LIMITED_MESSAGE,
      };
    }
    if (result.status === 400) {
      return { ok: false, message: INVALID_EMAIL_MESSAGE };
    }
    return {
      ok: false,
      message: messageFor(result, {}, REQUEST_FAILED_MESSAGE),
    };
  }

  return { ok: true };
}
