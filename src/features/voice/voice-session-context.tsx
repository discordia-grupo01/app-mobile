import {
  initialVoiceSessionState,
  parseVoiceBridgeEvent,
  serializeVoiceBridgeMessage,
  VOICE_CONNECT_FAILED,
  VOICE_CONNECTION_LOST,
  VOICE_EMBED_PATH,
  VOICE_MIC_DENIED,
  type VoiceBridgeCommand,
  type VoiceBridgeEvent,
  voiceDisconnectMessage,
  voiceSessionReducer,
  type VoiceSessionState,
  type VoiceSessionTarget,
} from "@discordia/client-shared";

import { requestRecordingPermissionsAsync } from "expo-audio";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { StyleSheet, View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

import { env } from "../../lib/env";
import { leaveVoiceSession, requestVoiceToken } from "./api";

/**
 * Expo Go no tiene el SDK nativo de LiveKit: la llamada corre en la pagina
 * `/voice-embed` de web-client, dentro de un WebView invisible.
 */
const VOICE_EMBED_URL = env.webUrl
  ? `${env.webUrl.replace(/\/$/, "")}${VOICE_EMBED_PATH}`
  : null;

interface VoiceSessionValue {
  state: VoiceSessionState;
  isAvailable: boolean;
  mediaError: string | null;
  leaveSettledCount: number;
  join: (target: VoiceSessionTarget) => void;
  leave: () => void;
  toggleMute: () => void;
  toggleMutedForMe: (identity: string) => void;
  focusConnectedChannel: () => void;
  dismissNotice: () => void;
}

const VoiceSessionContext = createContext<VoiceSessionValue | null>(null);

interface BridgeSession {
  url: string;
  token: string;
}

export function VoiceSessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    voiceSessionReducer,
    initialVoiceSessionState,
  );
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [leaveSettledCount, setLeaveSettledCount] = useState(0);
  // Con sesion se monta el WebView; al salir se desmonta y corta la llamada.
  const [bridge, setBridge] = useState<BridgeSession | null>(null);
  const webViewRef = useRef<WebView>(null);
  const isReadyRef = useRef(false);
  const pendingRef = useRef<VoiceBridgeCommand[]>([]);
  const sentMutedForMeRef = useRef<readonly string[]>([]);
  const attemptRef = useRef(0);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });

  const send = useCallback((command: VoiceBridgeCommand) => {
    if (!isReadyRef.current) {
      pendingRef.current.push(command);
      return;
    }
    const data = JSON.stringify(serializeVoiceBridgeMessage(command));
    webViewRef.current?.injectJavaScript(
      `window.dispatchEvent(new MessageEvent("message",{data:${data}}));true;`,
    );
  }, []);

  const closeBridge = useCallback(() => {
    attemptRef.current += 1;
    isReadyRef.current = false;
    pendingRef.current = [];
    sentMutedForMeRef.current = [];
    setBridge(null);
    setMediaError(null);
  }, []);

  const end = useCallback(
    (notice: string | null) => {
      closeBridge();
      dispatch({ type: "ended", notice });
    },
    [closeBridge],
  );

  const join = useCallback(
    async (target: VoiceSessionTarget) => {
      if (!VOICE_EMBED_URL) return;
      if (stateRef.current.target?.channelId === target.channelId) return;

      closeBridge();
      const attempt = attemptRef.current;
      dispatch({ type: "join_requested", target });

      const permission = await requestRecordingPermissionsAsync();
      if (attempt !== attemptRef.current) return;
      if (!permission.granted) {
        setMediaError(VOICE_MIC_DENIED);
        if (!stateRef.current.muted) dispatch({ type: "toggle_mute" });
      }

      const result = await requestVoiceToken(target.channelId);
      if (attempt !== attemptRef.current) return;
      if (!result.ok) {
        end(result.message);
        return;
      }
      setBridge({ url: result.token.url, token: result.token.token });
    },
    [closeBridge, end],
  );

  const leave = useCallback(async () => {
    const channelId = stateRef.current.target?.channelId;
    send({ type: "disconnect" });
    end(null);
    if (!channelId) return;

    const result = await leaveVoiceSession(channelId);
    setLeaveSettledCount((count) => count + 1);
    if (!result.ok && stateRef.current.target === null) {
      dispatch({ type: "ended", notice: result.message });
    }
  }, [end, send]);

  const handleEvent = useCallback(
    (event: VoiceBridgeEvent) => {
      switch (event.type) {
        case "ready": {
          isReadyRef.current = true;
          const pending = pendingRef.current;
          pendingRef.current = [];
          pending.forEach(send);
          return;
        }
        case "status":
          if (event.status === "idle") end(null);
          else dispatch({ type: "status", status: event.status });
          return;
        case "participants":
          dispatch({ type: "participants", participants: event.participants });
          return;
        case "speakPermission":
          dispatch({ type: "speak_permission", allowed: event.allowed });
          return;
        case "disconnected":
          end(voiceDisconnectMessage(event.reason));
          return;
        case "error":
          if (event.error === "connect_failed") {
            end(VOICE_CONNECT_FAILED);
          } else if (event.error === "mic_denied") {
            setMediaError(VOICE_MIC_DENIED);
            if (!stateRef.current.muted) dispatch({ type: "toggle_mute" });
          }
          // `audio_blocked` no pasa: el WebView reproduce sin gesto.
          return;
      }
    },
    [end, send],
  );

  const onMessage = useCallback(
    (message: WebViewMessageEvent) => {
      const event = parseVoiceBridgeEvent(message.nativeEvent.data);
      if (event) handleEvent(event);
    },
    [handleEvent],
  );

  useEffect(() => {
    if (!bridge) return;
    send({ type: "connect", url: bridge.url, token: bridge.token });
  }, [bridge, send]);

  const { muted, mutedForMe } = state;
  useEffect(() => {
    if (!bridge) return;
    send({ type: "setMicrophoneEnabled", enabled: !muted });
  }, [bridge, muted, send]);

  useEffect(() => {
    if (!bridge) return;
    const sent = sentMutedForMeRef.current;
    mutedForMe
      .filter((identity) => !sent.includes(identity))
      .forEach((identity) =>
        send({ type: "setMutedForMe", identity, muted: true }),
      );
    sent
      .filter((identity) => !mutedForMe.includes(identity))
      .forEach((identity) =>
        send({ type: "setMutedForMe", identity, muted: false }),
      );
    sentMutedForMeRef.current = mutedForMe;
  }, [bridge, mutedForMe, send]);

  const toggleMute = useCallback(() => {
    setMediaError(null);
    dispatch({ type: "toggle_mute" });
  }, []);
  const toggleMutedForMe = useCallback(
    (identity: string) => dispatch({ type: "toggle_muted_for_me", identity }),
    [],
  );
  const focusConnectedChannel = useCallback(
    () => dispatch({ type: "focus" }),
    [],
  );
  const dismissNotice = useCallback(
    () => dispatch({ type: "dismiss_notice" }),
    [],
  );
  const startJoin = useCallback(
    (target: VoiceSessionTarget) => void join(target),
    [join],
  );
  const startLeave = useCallback(() => void leave(), [leave]);

  const value = useMemo(
    () => ({
      state,
      isAvailable: VOICE_EMBED_URL !== null,
      mediaError,
      leaveSettledCount,
      join: startJoin,
      leave: startLeave,
      toggleMute,
      toggleMutedForMe,
      focusConnectedChannel,
      dismissNotice,
    }),
    [
      state,
      mediaError,
      leaveSettledCount,
      startJoin,
      startLeave,
      toggleMute,
      toggleMutedForMe,
      focusConnectedChannel,
      dismissNotice,
    ],
  );

  return (
    <VoiceSessionContext.Provider value={value}>
      {children}
      {bridge && VOICE_EMBED_URL ? (
        <View style={styles.bridge} pointerEvents="none">
          <WebView
            ref={webViewRef}
            source={{ uri: VOICE_EMBED_URL }}
            onMessage={onMessage}
            onError={() => end(VOICE_CONNECT_FAILED)}
            onHttpError={() => end(VOICE_CONNECT_FAILED)}
            onRenderProcessGone={() => end(VOICE_CONNECTION_LOST)}
            onContentProcessDidTerminate={() => end(VOICE_CONNECTION_LOST)}
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback
            mediaCapturePermissionGrantType="grant"
            javaScriptEnabled
          />
        </View>
      ) : null}
    </VoiceSessionContext.Provider>
  );
}

const styles = StyleSheet.create({
  // Fuera de la vista pero con tamano: un WebView de 0x0 puede no arrancar.
  bridge: { position: "absolute", width: 1, height: 1, opacity: 0 },
});

export function useVoiceSession(): VoiceSessionValue {
  const value = useContext(VoiceSessionContext);
  if (!value) {
    throw new Error(
      "useVoiceSession debe usarse dentro de <VoiceSessionProvider>",
    );
  }
  return value;
}

export function useOptionalVoiceSession(): VoiceSessionValue | null {
  return useContext(VoiceSessionContext);
}
