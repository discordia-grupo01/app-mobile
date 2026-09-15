/** Usuario tal como lo devuelve identify-service. */
export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

/** Respuesta OK de `POST /v1/login` y `POST /v1/users`. */
export interface AuthResponse {
  user: User;
  token: string;
}

/** Forma de error del backend: `{ error: { code, message, details? } }`. */
export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/** Sesion almacenada localmente en AsyncStorage. */
export interface Session {
  token: string;
  user: User;
}

/** Resultado del intento de login para la vista. */
export type LoginActionResult =
  { ok: true; user: User; token: string } | { ok: false; message: string };

/** Valores del formulario de login. */
export interface LoginValues {
  email: string;
  password: string;
}

/** Objeto con mensajes de error por campo (login). */
export interface LoginErrors {
  email?: string;
  password?: string;
}

/** Resultado del intento de registro para la vista (POST /v1/users tambien devuelve token: auto-login). */
export type RegisterActionResult =
  { ok: true; user: User; token: string } | { ok: false; message: string };

/** Valores del formulario de registro. */
export interface RegisterValues {
  name: string;
  email: string;
  password: string;
}

/** Objeto con mensajes de error por campo (registro). */
export interface RegisterErrors {
  name?: string;
  email?: string;
  password?: string;
}

/** Valores del formulario de recuperar contraseña. */
export interface ForgotPasswordValues {
  email: string;
}

/** Objeto con mensajes de error por campo (recuperar contraseña). */
export interface ForgotPasswordErrors {
  email?: string;
}

/**
 * Resultado de recuperar contraseña para la vista. El backend responde 202
 * exista o no el correo (para no permitir enumerar cuentas registradas), asi
 * que `ok: true` no confirma que el email este registrado.
 */
export type ForgotPasswordActionResult =
  { ok: true } | { ok: false; message: string };

/** Perfil publico de otro usuario (`GET /v1/users/:id`): sin email ni descripcion. */
export interface PublicUser {
  id: string;
  name: string;
  avatar_url: string;
  status_text?: string;
  status_emoji?: string;
  created_at: string;
  mutual_server_ids: string[];
}
