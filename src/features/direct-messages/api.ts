import {
  DM_CONVERSATIONS_LOAD_FAILED,
  DM_MARK_READ_FAILED,
  type DirectConversation,
  type ListConversationsResult,
  type MessageActionResult,
} from "@discordia/client-shared";

import { apiFetch } from "../../lib/api-client";

export async function listConversations(): Promise<ListConversationsResult> {
  const result = await apiFetch<{ conversations: DirectConversation[] }>(
    "/v1/conversations",
    { method: "GET" },
  );
  if (!result.ok || !Array.isArray(result.data?.conversations)) {
    return { ok: false, message: DM_CONVERSATIONS_LOAD_FAILED };
  }
  return { ok: true, conversations: result.data.conversations };
}

export async function markConversationRead(
  conversationId: string,
): Promise<MessageActionResult> {
  const result = await apiFetch<void>(
    `/v1/conversations/${encodeURIComponent(conversationId)}/read`,
    { method: "POST" },
  );
  return result.ok ? { ok: true } : { ok: false, message: DM_MARK_READ_FAILED };
}
