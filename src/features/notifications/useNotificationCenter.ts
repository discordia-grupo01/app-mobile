import {
  type ConversationSummary,
  NOTIFICATIONS_MARK_ALL_READ_FAILED,
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
  unread: {
    hasUnread: boolean;
    markAllRead: () => Promise<boolean>;
  };
  conversations: readonly ConversationSummary[];
  areConversationsLoading: boolean;
  activitySignal: number;
  openChannelId: string | null;
  openConversationId: string | null;
}

export function useNotificationCenter({
  userId,
  mentions,
  unread,
  conversations,
  areConversationsLoading,
  activitySignal,
  openChannelId,
  openConversationId,
}: NotificationCenterInput) {
  const history = useNotificationHistory(userId);
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

  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [markAllError, setMarkAllError] = useState<string | null>(null);
  const { markAllRead: markHistoryRead } = reads;
  const { hasUnread: hasUnreadChannels, markAllRead: markChannelsRead } =
    unread;
  const markAllRead = useCallback(async () => {
    markHistoryRead();
    setMarkAllError(null);
    if (!hasUnreadChannels) return;
    setIsMarkingAll(true);
    const ok = await markChannelsRead();
    setIsMarkingAll(false);
    if (!ok) setMarkAllError(NOTIFICATIONS_MARK_ALL_READ_FAILED);
  }, [markHistoryRead, hasUnreadChannels, markChannelsRead]);
  const canMarkAllRead =
    !isMarkingAll && (reads.unreadCount > 0 || hasUnreadChannels);

  const { refresh } = history;
  const open = useCallback(() => {
    void refresh();
    setMarkAllError(null);
    setIsOpen(true);
  }, [refresh]);
  const close = useCallback(() => setIsOpen(false), []);

  return {
    history,
    reads,
    isOpen,
    open,
    close,
    markAllRead,
    canMarkAllRead,
    isMarkingAll,
    markAllError,
  };
}

export type NotificationCenterState = ReturnType<typeof useNotificationCenter>;
