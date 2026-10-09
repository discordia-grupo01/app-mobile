import {
  addUnreadMention,
  clearChannelMentions,
  type MentionEventPayload,
  mergeUnreadMentions,
  NO_UNREAD_MENTIONS,
  type UnreadMentions,
  unreadByChannel,
  unreadByServer,
} from "@discordia/client-shared";

import { useCallback, useEffect, useMemo, useState } from "react";

import { listUnreadMentions, markChannelMentionsRead } from "./api";

export function useMentions(currentUserId: string | null) {
  const [unread, setUnread] = useState<UnreadMentions>(NO_UNREAD_MENTIONS);

  const reload = useCallback(
    () =>
      listUnreadMentions().then((result) => {
        if (result.ok) {
          setUnread((prev) => mergeUnreadMentions(prev, result.mentions));
        }
      }),
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

  const byChannel = useMemo(() => unreadByChannel(unread), [unread]);
  const byServer = useMemo(() => unreadByServer(unread), [unread]);

  return { byChannel, byServer, receive, reload, markChannelRead };
}
