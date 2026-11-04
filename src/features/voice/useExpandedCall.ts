import type {
  VoiceBridgeCommand,
  VoiceParticipant,
} from "@discordia/client-shared";

import {
  lockAsync,
  OrientationLock,
  unlockAsync,
} from "expo-screen-orientation";
import { useCallback, useEffect, useRef, useState } from "react";
import { BackHandler } from "react-native";

import { expandedIdentityAfter } from "./expanded-call";

export function useExpandedCall({
  participants,
  isBridgeOpen,
  send,
}: {
  participants: readonly VoiceParticipant[];
  isBridgeOpen: boolean;
  send: (command: VoiceBridgeCommand) => void;
}) {
  const [requestedIdentity, setRequestedIdentity] = useState<string | null>(
    null,
  );
  const expandedIdentity = isBridgeOpen
    ? expandedIdentityAfter(requestedIdentity, participants)
    : null;
  if (expandedIdentity !== requestedIdentity) {
    setRequestedIdentity(expandedIdentity);
  }

  const expand = useCallback(
    (identity: string) => setRequestedIdentity(identity),
    [],
  );
  const collapse = useCallback(() => setRequestedIdentity(null), []);

  const sentIdentity = useRef<string | null>(null);
  useEffect(() => {
    if (sentIdentity.current === expandedIdentity) return;
    const wasExpanded = sentIdentity.current !== null;
    sentIdentity.current = expandedIdentity;
    if (isBridgeOpen) send({ type: "setExpanded", identity: expandedIdentity });

    if (expandedIdentity) void unlockAsync().catch(() => undefined);
    else if (wasExpanded) {
      void lockAsync(OrientationLock.PORTRAIT_UP).catch(() => undefined);
    }
  }, [expandedIdentity, isBridgeOpen, send]);

  useEffect(() => {
    if (!expandedIdentity) return;
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        collapse();
        return true;
      },
    );
    return () => subscription.remove();
  }, [expandedIdentity, collapse]);

  return { expandedIdentity, expand, collapse };
}
