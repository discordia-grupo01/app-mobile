import {
  type ConversationSummary,
  withoutSuspendedServers,
} from "@discordia/client-shared";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  latestIncomingMessageId,
  messagingUnreadCheck,
} from "./history/historyHelpers";
import { useNotificationHistory } from "./history/useNotificationHistory";
import { useNotificationReads } from "./history/useNotificationReads";
import { useNotificationRefresh } from "./history/useNotificationRefresh";

interface NotificationCenterInput {
  userId: string | null;
  mentions: {
    isLoaded: boolean;
    isUnread: (messageId: string) => boolean;
  };
  conversations: readonly ConversationSummary[];
  areConversationsLoading: boolean;
  activitySignal: number;
  openChannelId: string | null;
  openConversationId: string | null;
  suspendedServerIds?: ReadonlySet<string>;
}

const NO_SUSPENDED: ReadonlySet<string> = new Set();

export function useNotificationCenter({
  userId,
  mentions,
  conversations,
  areConversationsLoading,
  activitySignal,
  openChannelId,
  openConversationId,
  suspendedServerIds = NO_SUSPENDED,
}: NotificationCenterInput) {
  const fullHistory = useNotificationHistory(userId);
  const visibleItems = useMemo(
    () => withoutSuspendedServers(fullHistory.items, suspendedServerIds),
    [fullHistory.items, suspendedServerIds],
  );
  const history = { ...fullHistory, items: visibleItems };
  const [isOpen, setIsOpen] = useState(false);

  const { isLoaded: areMentionsLoaded, isUnread: isMentionUnread } = mentions;
  const isUnreadInMessaging = useMemo(
    () =>
      messagingUnreadCheck({
        areMentionsLoaded,
        isMentionUnread,
        areConversationsLoading,
        conversations,
      }),
    [
      areMentionsLoaded,
      isMentionUnread,
      areConversationsLoading,
      conversations,
    ],
  );
  const reads = useNotificationReads(
    userId,
    history.items,
    isUnreadInMessaging,
  );

  const latestIncoming = latestIncomingMessageId(conversations, userId);
  const [seenIncoming, setSeenIncoming] = useState<string | null | undefined>(
    undefined,
  );
  const [directSignal, setDirectSignal] = useState(0);
  if (!areConversationsLoading && latestIncoming !== seenIncoming) {
    setSeenIncoming(latestIncoming);
    if (seenIncoming !== undefined && latestIncoming !== null) {
      setDirectSignal((signal) => signal + 1);
    }
  }

  useNotificationRefresh(activitySignal + directSignal, history.refresh);

  const { markChannelRead, markConversationRead } = reads;
  useEffect(() => {
    if (openChannelId) markChannelRead(openChannelId);
  }, [openChannelId, history.items, markChannelRead]);
  useEffect(() => {
    if (openConversationId) markConversationRead(openConversationId);
  }, [openConversationId, history.items, markConversationRead]);

  const { refresh } = history;
  const open = useCallback(() => {
    void refresh();
    setIsOpen(true);
  }, [refresh]);
  const close = useCallback(() => setIsOpen(false), []);

  return { history, reads, isOpen, open, close };
}

export type NotificationCenterState = ReturnType<typeof useNotificationCenter>;
