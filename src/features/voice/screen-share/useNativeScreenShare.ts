import {
  VOICE_SCREEN_SHARE_DENIED,
  VOICE_SCREEN_SHARE_FAILED,
  type VoiceSessionTarget,
} from "@discordia/client-shared";

import type { LocalTrackPublication, Room } from "livekit-client";
import { useCallback, useEffect, useRef } from "react";

import { requestScreenShareToken } from "../api";
import { loadLiveKitNative } from "./livekit-native";

export function useNativeScreenShare(
  onStopped: (notice: string | null) => void,
) {
  const roomRef = useRef<Room | null>(null);
  const attemptRef = useRef(0);
  const onStoppedRef = useRef(onStopped);
  useEffect(() => {
    onStoppedRef.current = onStopped;
  });

  const stop = useCallback(() => {
    attemptRef.current += 1;
    const room = roomRef.current;
    roomRef.current = null;
    if (!room) return;
    room.removeAllListeners();
    void room.localParticipant
      .setScreenShareEnabled(false)
      .catch(() => undefined)
      .finally(() => void room.disconnect());
  }, []);

  const start = useCallback(
    async (target: VoiceSessionTarget) => {
      stop();
      const attempt = attemptRef.current;
      const isCurrent = () => attempt === attemptRef.current;
      const fail = (notice: string | null) => {
        if (!isCurrent()) return;
        stop();
        onStoppedRef.current(notice);
      };

      const result = await requestScreenShareToken(target);
      if (!isCurrent()) return;
      if (!result.ok) {
        onStoppedRef.current(result.message);
        return;
      }

      const { Room, RoomEvent, ScreenSharePresets, Track } =
        loadLiveKitNative();
      const room = new Room({ adaptiveStream: false, dynacast: true });
      roomRef.current = room;

      try {
        await room.connect(result.token.url, result.token.token, {
          autoSubscribe: false,
        });
      } catch {
        fail(VOICE_SCREEN_SHARE_FAILED);
        return;
      }
      if (!isCurrent()) {
        void room.disconnect();
        return;
      }

      room.on(RoomEvent.Disconnected, () => fail(null));
      room.on(
        RoomEvent.LocalTrackUnpublished,
        (publication: LocalTrackPublication) => {
          if (publication.source === Track.Source.ScreenShare) fail(null);
        },
      );

      try {
        // Aca Android muestra el permiso para grabar o transmitir la pantalla.
        await room.localParticipant.setScreenShareEnabled(true, {
          audio: false,
          resolution: ScreenSharePresets.h720fps15.resolution,
        });
      } catch (error) {
        fail(
          isPermissionDenied(error)
            ? VOICE_SCREEN_SHARE_DENIED
            : VOICE_SCREEN_SHARE_FAILED,
        );
      }
    },
    [stop],
  );

  useEffect(() => stop, [stop]);

  return { start, stop };
}

function isPermissionDenied(error: unknown): boolean {
  return error instanceof Error && error.name === "NotAllowedError";
}
