import { ApiError, NetworkError, apiFetch } from "../../lib/api-client";
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

const NETWORK_ERROR_MESSAGE =
  "No hay conexión con el servidor. Revisá tu conexión a internet e intentá de nuevo.";

export async function registerService(
  values: RegisterValues,
): Promise<RegisterActionResult> {
  try {
    await apiFetch<User>("/v1/users", {
      method: "POST",
      body: JSON.stringify({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
      }),
    });

    return { ok: true };
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

export async function logoutService(): Promise<void> {
  try {
    await apiFetch("/v1/logout", { method: "POST" });
  } catch {}
}

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
