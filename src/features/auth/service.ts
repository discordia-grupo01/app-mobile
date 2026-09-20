import {
  INVALID_DATA_MESSAGE,
  messageFor,
  REQUEST_FAILED_MESSAGE,
} from "@discordia/client-shared";

import { apiFetch } from "../../lib/api-client";
import type {
  AuthResponse,
  ForgotPasswordActionResult,
  LoginActionResult,
  LoginValues,
  PublicUser,
  RegisterActionResult,
  RegisterValues,
  User,
} from "./types";

export async function registerService(
  values: RegisterValues,
): Promise<RegisterActionResult> {
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
      return { ok: false, message: "Ese correo ya está registrado." };
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
): Promise<LoginActionResult> {
  const result = await apiFetch<AuthResponse>("/v1/login", {
    method: "POST",
    body: JSON.stringify({
      email: credentials.email.trim(),
      password: credentials.password,
    }),
  });

  if (!result.ok) {
    if (result.status === 401 || result.status === 400) {
      return { ok: false, message: "Email o contraseña incorrectos." };
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
): Promise<LoginActionResult> {
  const result = await apiFetch<AuthResponse>("/v1/oauth/google", {
    method: "POST",
    body: JSON.stringify({ id_token: idToken }),
  });

  if (!result.ok) {
    if (result.status === 503) {
      return {
        ok: false,
        message:
          "Google no está disponible en este momento. Iniciá sesión con tu correo y contraseña.",
      };
    }
    return {
      ok: false,
      message: messageFor(
        result,
        {},
        "No pudimos verificar tu cuenta de Google. Iniciá sesión con tu correo y contraseña.",
      ),
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
): Promise<ForgotPasswordActionResult> {
  const result = await apiFetch<{ message: string }>("/v1/password-recovery", {
    method: "POST",
    body: JSON.stringify({ email: email.trim() }),
  });

  if (!result.ok) {
    if (result.status === 429) {
      return {
        ok: false,
        message:
          "Alcanzaste el límite de solicitudes. Intentá de nuevo más tarde.",
      };
    }
    if (result.status === 400) {
      return { ok: false, message: "Ingresá un correo electrónico válido." };
    }
    return {
      ok: false,
      message: messageFor(result, {}, REQUEST_FAILED_MESSAGE),
    };
  }

  return { ok: true };
}
