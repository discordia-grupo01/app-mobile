/**
 * Tipos de auth de la app.
 *
 * Lo que describe al backend (usuarios, respuestas, formas de error) y lo que
 * describe los formularios vive en `@discordia/client-shared`: es identico en
 * las dos apps porque lo define el backend, no la pantalla. Aca quedan solo
 * los `*ActionResult`, que son la forma en que **esta** app devuelve el
 * resultado de una accion a sus componentes.
 *
 * El re-export existe para que los ~20 archivos que hacen `from "../auth/types"`
 * no tengan que cambiar.
 */
import type { User } from "@discordia/client-shared";

export type {
  ApiErrorBody,
  AuthResponse,
  ForgotPasswordErrors,
  ForgotPasswordValues,
  LoginErrors,
  LoginValues,
  PublicUser,
  RegisterErrors,
  RegisterValues,
  User,
} from "@discordia/client-shared";

/** `SessionBase` del paquete, con el nombre que ya usa la app. */
export type { SessionBase as Session } from "@discordia/client-shared";

export type LoginActionResult =
  { ok: true; user: User; token: string } | { ok: false; message: string };

export type RegisterActionResult =
  { ok: true } | { ok: false; message: string };

export type ForgotPasswordActionResult =
  { ok: true } | { ok: false; message: string };
