import {
  type MessageAuthor,
  messageAuthorOf,
  type NotificationHistoryItem,
} from "@discordia/client-shared";

import { useEffect, useRef, useState } from "react";

import { avatarUriOf } from "../../../../lib/userProfile";
import { getPublicProfile } from "../../../profile/service";

export function useNotificationAuthors(
  items: readonly NotificationHistoryItem[],
): Record<string, MessageAuthor> {
  const [authors, setAuthors] = useState<Record<string, MessageAuthor>>({});
  const requested = useRef(new Set<string>());
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const missing = [...new Set(items.map((item) => item.author_id))].filter(
      (id) => !requested.current.has(id),
    );
    missing.forEach((id) => requested.current.add(id));

    missing.forEach((id) => {
      void getPublicProfile(id).then((result) => {
        if (!isMounted.current || !result.ok) return;
        const { user } = result;
        setAuthors((previous) => ({
          ...previous,
          [id]: messageAuthorOf(user.id, user.name, avatarUriOf(user)),
        }));
      });
    });
  }, [items]);

  return authors;
}
