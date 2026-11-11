import type {
  ConversationSummary,
  NotificationHistoryItem,
  NotificationUnreadCheck,
  PushTarget,
} from "@discordia/client-shared";

export function notificationTargetOf(
  item: NotificationHistoryItem,
): PushTarget | null {
  if (item.kind === "direct_message") {
    return { kind: "direct", partnerId: item.author_id };
  }
  if (item.server_id && item.channel_id) {
    return {
      kind: "channel",
      serverId: item.server_id,
      channelId: item.channel_id,
    };
  }
  return null;
}

export function latestIncomingMessageId(
  conversations: readonly ConversationSummary[],
  myId: string | null,
): string | null {
  let latest: { id: string; at: number } | null = null;
  for (const { lastMessage } of conversations) {
    if (!lastMessage || lastMessage.user_id === myId) continue;
    const at = Date.parse(lastMessage.inserted_at);
    if (!latest || at > latest.at) latest = { id: lastMessage.id, at };
  }
  return latest?.id ?? null;
}

interface MessagingUnreadSources {
  areMentionsLoaded: boolean;
  isMentionUnread: (messageId: string) => boolean;
  areConversationsLoading: boolean;
  conversations: readonly ConversationSummary[];
}

export function messagingUnreadCheck({
  areMentionsLoaded,
  isMentionUnread,
  areConversationsLoading,
  conversations,
}: MessagingUnreadSources): NotificationUnreadCheck {
  const unreadByConversation = new Map(
    conversations.flatMap((conversation) =>
      conversation.conversationId
        ? [[conversation.conversationId, conversation.isUnread] as const]
        : [],
    ),
  );
  return (item) => {
    if (item.kind === "ownership_transfer") return true;
    if (item.kind === "mention") {
      return !areMentionsLoaded || isMentionUnread(item.message_id);
    }
    if (areConversationsLoading) return true;
    return unreadByConversation.get(item.conversation_id ?? "") ?? true;
  };
}
