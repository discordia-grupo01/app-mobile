import type { ServerEmoji, ServerEmojiPage } from "@discordia/client-shared";
import { useCallback, useEffect, useState } from "react";

import { useRefreshOnChange } from "../../hooks/useRefreshOnChange";
import { listServerEmojis } from "./api";

export function useServerEmojis(serverId: string | null) {
  const [page, setPage] = useState<ServerEmojiPage | null>(null);
  const [error, setError] = useState<string>();
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (serverId === null) return;
    let cancelled = false;
    listServerEmojis(serverId).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setError(undefined);
        setPage(result.page);
      } else {
        setError(result.message);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [serverId, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  useRefreshOnChange({ resources: ["emojis"], serverId }, reload, {
    enabled: serverId !== null,
  });

  const addEmoji = useCallback((emoji: ServerEmoji) => {
    setPage((current) =>
      current === null ||
      current.emojis.some((existing) => existing.id === emoji.id)
        ? current
        : { ...current, emojis: [...current.emojis, emoji] },
    );
  }, []);

  const removeEmoji = useCallback((emojiId: string) => {
    setPage((current) =>
      current === null
        ? current
        : {
            ...current,
            emojis: current.emojis.filter((emoji) => emoji.id !== emojiId),
          },
    );
  }, []);

  const isLoading = serverId !== null && page === null && error === undefined;

  return { page, error, isLoading, reload, addEmoji, removeEmoji };
}
