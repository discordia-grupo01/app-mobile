import {
  type MessageSearchQuery,
  type MessageSearchResponse,
  messageSearchErrorFor,
  messageSearchParams,
  type SearchMessagesResult,
  SESSION_EXPIRED_MESSAGE,
} from "@discordia/client-shared";

import { apiFetch } from "../../lib/api-client";

/**
 * Una pagina de la busqueda de mensajes del servidor (de mas nuevo a mas
 * viejo). `before` es el `nextCursor` de la pagina anterior.
 */
export async function searchMessages(
  serverId: string,
  query: MessageSearchQuery,
  before: string | null = null,
): Promise<SearchMessagesResult> {
  const params = new URLSearchParams(messageSearchParams(query, before));
  const result = await apiFetch<MessageSearchResponse>(
    `/v1/servers/${encodeURIComponent(serverId)}/messages/search?${params.toString()}`,
    { method: "GET" },
  );

  if (!result.ok) {
    if (result.status === 401) {
      return { ok: false, message: SESSION_EXPIRED_MESSAGE };
    }
    return {
      ok: false,
      message: messageSearchErrorFor(result.code, result.status),
    };
  }
  if (!Array.isArray(result.data?.messages)) {
    return { ok: false, message: messageSearchErrorFor(undefined) };
  }
  return {
    ok: true,
    messages: result.data.messages,
    nextCursor: result.data.next_cursor,
    total: result.data.total,
    totalCapped: result.data.total_capped ?? false,
  };
}
