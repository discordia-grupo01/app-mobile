import {
  filterNotificationHistory,
  groupNotificationHistory,
  isNotificationVisible,
  type MessageAuthor,
  notificationPreview,
  type NotificationTab,
} from "@discordia/client-shared";

import { useMemo, useState } from "react";

import type { NotificationHistoryState } from "../../history/useNotificationHistory";
import { useNotificationAuthors } from "./useNotificationAuthors";
import { useNotificationMessages } from "./useNotificationMessages";
import { useNotificationRoles } from "./useNotificationRoles";
import type { NotificationReadsState } from "../../history/useNotificationReads";

export function useNotificationCenterView(
  history: NotificationHistoryState,
  reads: NotificationReadsState,
  me: MessageAuthor | null,
) {
  const [tab, setTab] = useState<NotificationTab>("unread");
  const authors = useNotificationAuthors(history.items);
  const messages = useNotificationMessages(history.items);
  const roleNames = useNotificationRoles(history.items);

  const groups = useMemo(
    () =>
      groupNotificationHistory(
        filterNotificationHistory(history.items, tab, reads.isUnread),
      ),
    [history.items, tab, reads.isUnread],
  );

  const previews = useMemo(() => {
    const nameOf = (kind: "user" | "role", id: string) => {
      if (kind === "role") return roleNames[id.toLowerCase()] ?? null;
      return (me?.id === id ? me.name : authors[id]?.name) ?? null;
    };
    return Object.fromEntries(
      Object.entries(messages).map(([id, message]) => [
        id,
        notificationPreview(message, nameOf),
      ]),
    );
  }, [messages, authors, roleNames, me]);

  const oldestLoaded = history.items.at(-1);
  const canLoadMore =
    history.hasMore &&
    oldestLoaded !== undefined &&
    (tab === "unread"
      ? reads.isUnread(oldestLoaded)
      : isNotificationVisible(oldestLoaded, reads.isUnread));
  const isEmpty =
    history.status === "ready" && groups.length === 0 && !canLoadMore;

  return { tab, setTab, authors, groups, previews, canLoadMore, isEmpty };
}
