import {
  isMessageErrorCode,
  type ListMessagesResult,
  messageErrorFor,
  type MessageHistory,
  MESSAGES_LOAD_FAILED,
  SESSION_EXPIRED_MESSAGE,
  type SocketTicketResult,
} from "@discordia/client-shared";

import { apiFetch } from "../../lib/api-client";

/**
 * Pide un ticket de un solo uso (vence a los 30 s) para abrir el WebSocket.
 * `sessionExpired` distingue una sesion muerta (no tiene sentido reintentar) de
 * un fallo transitorio de red o del servicio (se puede reintentar).
 */
export async function fetchSocketTicket(): Promise<SocketTicketResult> {
  const result = await apiFetch<{ ticket?: string }>("/v1/socket-tickets", {
    method: "POST",
  });
  if (result.ok && typeof result.data?.ticket === "string") {
    return { ok: true, ticket: result.data.ticket };
  }
  return { ok: false, sessionExpired: !result.ok && result.status === 401 };
}

/**
 * Una pagina del historial del canal (de mas viejo a mas nuevo). Para la pagina
 * anterior se pasa el `nextCursor` de la respuesta como `before`; para traer lo
 * posterior a un mensaje, su id como `after`.
 */
export async function fetchMessages(
  channelId: string,
  options: { limit?: number; before?: string; after?: string } = {},
): Promise<ListMessagesResult> {
  const query = new URLSearchParams();
  if (options.limit !== undefined) query.set("limit", String(options.limit));
  if (options.before) query.set("before", options.before);
  if (options.after) query.set("after", options.after);
  const qs = query.toString();

  const result = await apiFetch<MessageHistory>(
    `/v1/channels/${encodeURIComponent(channelId)}/messages${qs ? `?${qs}` : ""}`,
    { method: "GET" },
  );

  if (!result.ok) {
    if (result.status === 401) {
      return { ok: false, message: SESSION_EXPIRED_MESSAGE };
    }
    return {
      ok: false,
      message: messageErrorFor(result.code, MESSAGES_LOAD_FAILED),
      ...(isMessageErrorCode(result.code) ? { code: result.code } : {}),
    };
  }
  if (!Array.isArray(result.data?.messages)) {
    return { ok: false, message: MESSAGES_LOAD_FAILED };
  }
  return {
    ok: true,
    messages: result.data.messages,
    nextCursor: result.data.next_cursor,
  };
}
