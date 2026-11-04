import {
  addUnreadMention,
  clearChannelMentions,
  filterHighlightedMentions,
  type MentionEventPayload,
  mergeUnreadMentions,
  NO_NOTIFICATION_SETTINGS,
  NO_UNREAD_MENTIONS,
  type NotificationSettings,
  type UnreadMentions,
  unreadByChannel,
  unreadByServer,
} from "@discordia/client-shared";

import { useCallback, useEffect, useMemo, useState } from "react";

import { listUnreadMentions, markChannelMentionsRead } from "./api";

export function useMentions(
  currentUserId: string | null,
  settings: NotificationSettings = NO_NOTIFICATION_SETTINGS,
) {
  const [unread, setUnread] = useState<UnreadMentions>(NO_UNREAD_MENTIONS);
  const [isLoaded, setIsLoaded] = useState(false);

  const reload = useCallback(
    () =>
      listUnreadMentions()
        .then((result) => {
          if (result.ok) {
            setUnread((prev) => mergeUnreadMentions(prev, result.mentions));
          }
        })
        .finally(() => setIsLoaded(true)),
    [],
  );

  useEffect(() => {
    if (currentUserId) void reload();
  }, [currentUserId, reload]);

  const receive = useCallback(
    (payload: MentionEventPayload) =>
      setUnread((prev) => addUnreadMention(prev, payload)),
    [],
  );

  const markChannelRead = useCallback((channelId: string) => {
    setUnread((prev) => clearChannelMentions(prev, channelId));
    void markChannelMentionsRead(channelId);
  }, []);

  const isUnread = useCallback(
    (messageId: string) => messageId in unread,
    [unread],
  );

  const allByChannel = useMemo(() => unreadByChannel(unread), [unread]);
  const highlighted = useMemo(
    () => filterHighlightedMentions(unread, settings),
    [unread, settings],
  );
  const byChannel = useMemo(() => unreadByChannel(highlighted), [highlighted]);
  const byServer = useMemo(() => unreadByServer(highlighted), [highlighted]);

  return {
    allByChannel,
    byChannel,
    byServer,
    isLoaded,
    isUnread,
    receive,
    reload,
    markChannelRead,
  };
}
