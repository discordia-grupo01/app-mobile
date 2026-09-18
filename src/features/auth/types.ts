export interface User {
  id: string;
  name: string;
  email: string;
  description: string;
  avatar_url: string;
  status_text: string;
  status_emoji: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface Session {
  token: string;
  user: User;
}

export type LoginActionResult =
  { ok: true; user: User; token: string } | { ok: false; message: string };

export interface LoginValues {
  email: string;
  password: string;
}

export interface LoginErrors {
  email?: string;
  password?: string;
}

export type RegisterActionResult =
  { ok: true } | { ok: false; message: string };

export interface RegisterValues {
  name: string;
  email: string;
  password: string;
}

export interface RegisterErrors {
  name?: string;
  email?: string;
  password?: string;
}

export interface ForgotPasswordValues {
  email: string;
}

export interface ForgotPasswordErrors {
  email?: string;
}

export type ForgotPasswordActionResult =
  { ok: true } | { ok: false; message: string };

export interface PublicUser {
  id: string;
  name: string;
  description: string;
  avatar_url: string;
  status_text: string;
  status_emoji: string;
  mutual_server_ids: string[];
  is_suspended?: boolean;
}
