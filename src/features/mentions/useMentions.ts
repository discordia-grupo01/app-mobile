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
  withoutSuspendedEntries,
} from "@discordia/client-shared";

import { useCallback, useEffect, useMemo, useState } from "react";

import { listUnreadMentions, markChannelMentionsRead } from "./api";

const NO_SUSPENDED: ReadonlySet<string> = new Set();

/**
 * Las menciones de `suspendedServerIds` no cuentan mientras dure la
 * suspensión; quedan guardadas y vuelven al reactivar el servidor.
 */
export function useMentions(
  currentUserId: string | null,
  settings: NotificationSettings = NO_NOTIFICATION_SETTINGS,
  suspendedServerIds: ReadonlySet<string> = NO_SUSPENDED,
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

  const visible = useMemo(
    () => withoutSuspendedEntries(unread, suspendedServerIds),
    [unread, suspendedServerIds],
  );
  const allByChannel = useMemo(() => unreadByChannel(visible), [visible]);
  const highlighted = useMemo(
    () => filterHighlightedMentions(visible, settings),
    [visible, settings],
  );
  const byChannel = useMemo(() => unreadByChannel(highlighted), [highlighted]);
  const byServer = useMemo(() => unreadByServer(highlighted), [highlighted]);
  const hasUnread = Object.keys(visible).length > 0;

  const markAllRead = useCallback(async () => {
    const channelIds = Object.keys(allByChannel);
    const results = await Promise.all(
      channelIds.map((channelId) => markChannelMentionsRead(channelId)),
    );
    const read = channelIds.filter((_, index) => results[index]?.ok);
    if (read.length > 0) {
      setUnread((prev) => read.reduce(clearChannelMentions, prev));
    }
    return read.length === channelIds.length;
  }, [allByChannel]);

  const markServerRead = useCallback(
    (serverId: string) => {
      const channelIds = new Set(
        Object.values(visible)
          .filter((mention) => mention.serverId === serverId)
          .map((mention) => mention.channelId),
      );
      channelIds.forEach(markChannelRead);
    },
    [visible, markChannelRead],
  );

  return {
    allByChannel,
    byChannel,
    byServer,
    hasUnread,
    isLoaded,
    isUnread,
    receive,
    reload,
    markChannelRead,
    markAllRead,
    markServerRead,
  };
}
