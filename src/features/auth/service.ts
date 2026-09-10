import { ApiError, apiFetch } from "../../lib/api-client";
import type {
  AuthResponse,
  LoginActionResult,
  LoginValues,
  RegisterActionResult,
  RegisterValues,
} from "./types";

/**
 * Servicio de llamadas HTTP a identify-service (via el Gateway):
 * `/v1/users` (registro), `/v1/login` y `/v1/logout`.
 */

export async function registerService(
  values: RegisterValues,
): Promise<RegisterActionResult> {
  try {
    const data = await apiFetch<AuthResponse>("/v1/users", {
      method: "POST",
      body: JSON.stringify({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
      }),
    });

    return { ok: true, user: data.user, token: data.token };
  } catch (err) {
    if (err instanceof ApiError && err.status === 409) {
      return { ok: false, message: "Ese correo ya esta registrado." };
    }
    if (err instanceof ApiError && err.status === 400) {
      return { ok: false, message: "Revisa los datos ingresados." };
    }

    return {
      ok: false,
      message: "No pudimos procesar la solicitud. Intenta de nuevo.",
    };
  }
}

export async function loginService(
  credentials: LoginValues,
): Promise<LoginActionResult> {
  try {
    const data = await apiFetch<AuthResponse>("/v1/login", {
      method: "POST",
      body: JSON.stringify({
        email: credentials.email.trim(),
        password: credentials.password,
      }),
    });

    return { ok: true, user: data.user, token: data.token };
  } catch (err) {
    if (err instanceof ApiError && (err.status === 401 || err.status === 400)) {
      return {
        ok: false,
        message: "Email o contrasena incorrectos.",
      };
    }

    return {
      ok: false,
      message: "No pudimos procesar la solicitud. Intenta de nuevo.",
    };
  }
}

export async function logoutService(token?: string | null): Promise<void> {
  if (!token) return;
  try {
    await apiFetch("/v1/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {}
}
