import type { Message } from "@discordia/client-shared";

import { createDemoMessages } from "./mock-data";

// TODO: reemplazar por un `api.ts` contra el Gateway cuando el back tenga mensajes.
const messagesByChannel = new Map<string, Message[]>();

export function loadChannelMessages(
  channelId: string,
  channelName: string,
): Message[] {
  const stored = messagesByChannel.get(channelId);
  if (stored) return stored;

  const seeded = createDemoMessages(channelId, channelName);
  messagesByChannel.set(channelId, seeded);
  return seeded;
}

export function saveChannelMessages(
  channelId: string,
  messages: Message[],
): void {
  messagesByChannel.set(channelId, messages);
}

export function createLocalMessage(
  channelId: string,
  authorId: string,
  content: string,
): Message {
  return {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    channel_id: channelId,
    server_id: "local",
    user_id: authorId,
    content: content.trim(),
    inserted_at: new Date().toISOString(),
    edited_at: null,
    deleted_at: null,
    reactions: [],
  };
}
