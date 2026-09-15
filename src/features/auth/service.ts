import { ApiError, NetworkError, apiFetch } from "../../lib/api-client";
import type {
  AuthResponse,
  ForgotPasswordActionResult,
  LoginActionResult,
  LoginValues,
  PublicUser,
  RegisterActionResult,
  RegisterValues,
} from "./types";

/**
 * Servicio de llamadas HTTP a identify-service (via el Gateway):
 * `/v1/users` (registro), `/v1/login`, `/v1/logout` y `/v1/password-recovery`.
 */

const NETWORK_ERROR_MESSAGE =
  "No hay conexión con el servidor. Revisá tu conexión a internet e intentá de nuevo.";

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
    if (err instanceof NetworkError) {
      return { ok: false, message: NETWORK_ERROR_MESSAGE };
    }
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
    if (err instanceof NetworkError) {
      return { ok: false, message: NETWORK_ERROR_MESSAGE };
    }
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

/**
 * Perfil publico de otro usuario (`GET /v1/users/:id`), para pintar
 * nombre/avatar en listas como el picker de "Transferir propiedad"
 * (`TransferOwnershipModal`). Es "best effort": si falla (red, 404, etc.)
 * devuelve `null` en vez de tirar, para que el llamador pueda mostrar un
 * fallback (inicial del ID) en vez de romper toda la lista por un solo
 * perfil que no cargo.
 */
export async function getPublicUser(
  userId: string,
): Promise<PublicUser | null> {
  try {
    return await apiFetch<PublicUser>(`/v1/users/${userId}`, {
      method: "GET",
    });
  } catch {
    return null;
  }
}

/**
 * Solicita el envio del mail de recuperacion. El backend responde 202
 * exista o no el correo (para no permitir enumerar cuentas registradas), asi
 * que un `ok: true` solo confirma que la solicitud se proceso, no que el
 * email este registrado.
 */
export async function forgotPasswordService(
  email: string,
): Promise<ForgotPasswordActionResult> {
  try {
    await apiFetch<{ message: string }>("/v1/password-recovery", {
      method: "POST",
      body: JSON.stringify({ email: email.trim() }),
    });

    return { ok: true };
  } catch (err) {
    if (err instanceof NetworkError) {
      return { ok: false, message: NETWORK_ERROR_MESSAGE };
    }
    if (err instanceof ApiError && err.status === 429) {
      return {
        ok: false,
        message:
          "Alcanzaste el limite de solicitudes. Intenta de nuevo mas tarde.",
      };
    }
    if (err instanceof ApiError && err.status === 400) {
      return { ok: false, message: "Ingresa un correo electronico valido." };
    }

    return {
      ok: false,
      message: "No pudimos procesar la solicitud. Intenta de nuevo mas tarde.",
    };
  }
}
