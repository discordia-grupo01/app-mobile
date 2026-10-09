import {
  type ListMentionsResult,
  MENTIONS_LOAD_FAILED,
  MENTIONS_MARK_READ_FAILED,
  type MentionsResponse,
  type MessageActionResult,
  UNREAD_MENTIONS_LIMIT,
} from "@discordia/client-shared";

import { apiFetch } from "../../lib/api-client";

/** Menciones sin leer (`GET /v1/mentions`): las mismas que llegan en vivo como evento `mention`. */
export async function listUnreadMentions(): Promise<ListMentionsResult> {
  const result = await apiFetch<MentionsResponse>(
    `/v1/mentions?limit=${UNREAD_MENTIONS_LIMIT}`,
    { method: "GET" },
  );
  if (!result.ok || !Array.isArray(result.data?.mentions)) {
    return { ok: false, message: MENTIONS_LOAD_FAILED };
  }
  return { ok: true, mentions: result.data.mentions };
}

/** Marca como leidas las menciones del usuario en un canal (`POST /v1/channels/:id/mentions/read`). */
export async function markChannelMentionsRead(
  channelId: string,
): Promise<MessageActionResult> {
  const result = await apiFetch<void>(
    `/v1/channels/${encodeURIComponent(channelId)}/mentions/read`,
    { method: "POST" },
  );
  return result.ok
    ? { ok: true }
    : { ok: false, message: MENTIONS_MARK_READ_FAILED };
}
