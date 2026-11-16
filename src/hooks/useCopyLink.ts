import { INVITE_COPY_FAILED } from "@discordia/client-shared";
import * as Clipboard from "expo-clipboard";

import { useCallback, useEffect, useRef, useState } from "react";

const COPIED_FEEDBACK_MS = 2000;

export function useCopyLink() {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = useCallback(async (link: string) => {
    setError("");
    try {
      await Clipboard.setStringAsync(link);
    } catch {
      setError(INVITE_COPY_FAILED);
      return;
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
  }, []);

  return { copied, error, copy };
}
