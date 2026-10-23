import {
  initialVoiceSessionState,
  parseVoiceBridgeEvent,
  pinOnScreenShareChange,
  screenSharingIds,
  serializeVoiceBridgeMessage,
  VOICE_CAMERA_DENIED,
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
import { requestCameraPermissionsAsync } from "expo-image-picker";
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
  type ComponentRef,
} from "react";
import { StyleSheet, View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

import { env } from "../../lib/env";
import { avatarUriOf } from "../../lib/userProfile";
import { useTheme, useThemeColors } from "../../theme/theme-context";
import { useAuth } from "../auth/auth-context";
import { leaveVoiceSession, requestVoiceToken } from "./api";

// react-native-webview 14 declara `WebView<P = undefined>` y `WebViewProps & undefined`
// colapsa a `never`; pasando el genérico explícito vuelven a tiparse las props y el ref.
type EmbedWebView = WebView<object>;

const VOICE_EMBED_URL = env.webUrl
  ? `${env.webUrl.replace(/\/$/, "")}${VOICE_EMBED_PATH}`
  : null;

export interface CallStageFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface VoiceSessionValue {
  state: VoiceSessionState;
  isAvailable: boolean;
  mediaError: string | null;
  leaveSettledCount: number;
  join: (target: VoiceSessionTarget) => void;
  leave: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  setCallStage: (frame: CallStageFrame | null) => void;
  toggleMutedForMe: (identity: string) => void;
  pinnedIdentity: string | null;
  setPinnedIdentity: (identity: string | null) => void;
  isParticipantsOpen: boolean;
  openParticipants: () => void;
  closeParticipants: () => void;
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
  const [callStage, setCallStage] = useState<CallStageFrame | null>(null);
  const [pinnedIdentity, setPinnedIdentity] = useState<string | null>(null);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [lastSharingIds, setLastSharingIds] = useState<readonly string[]>([]);
  const [overlayOrigin, setOverlayOrigin] = useState({ x: 0, y: 0 });
  const overlayRef = useRef<ComponentRef<typeof View>>(null);
  const { theme } = useTheme();
  const colors = useThemeColors();
  const { user } = useAuth();
  const localAvatarUrl = avatarUriOf(user);
  const [bridge, setBridge] = useState<BridgeSession | null>(null);
  const [isEmbedPainted, setIsEmbedPainted] = useState(false);
  const webViewRef = useRef<EmbedWebView>(null);
  const isReadyRef = useRef(false);
  const pendingRef = useRef<VoiceBridgeCommand[]>([]);
  const sentMutedForMeRef = useRef<readonly string[]>([]);
  const attemptRef = useRef(0);
  const sharingIds = screenSharingIds(state.participants);
  if (sharingIds.join("|") !== lastSharingIds.join("|")) {
    setLastSharingIds(sharingIds);
    setPinnedIdentity((pinned) =>
      pinOnScreenShareChange(pinned, lastSharingIds, state.participants),
    );
  }
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
    setIsEmbedPainted(false);
    setMediaError(null);
    setPinnedIdentity(null);
    setIsParticipantsOpen(false);
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
          setIsEmbedPainted(true);
          dispatch({ type: "participants", participants: event.participants });
          return;
        case "speakPermission":
          dispatch({ type: "speak_permission", allowed: event.allowed });
          return;
        case "cameraStopped":
          if (stateRef.current.cameraOn) dispatch({ type: "toggle_camera" });
          return;
        case "muteForMeRequested":
          dispatch({ type: "toggle_muted_for_me", identity: event.identity });
          return;
        case "participantsRequested":
          setIsParticipantsOpen(true);
          return;
        case "pinRequested":
          setPinnedIdentity(event.identity);
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
          } else if (event.error === "camera_denied") {
            setMediaError(VOICE_CAMERA_DENIED);
          }
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

  const { muted, cameraOn, mutedForMe } = state;
  useEffect(() => {
    if (!bridge) return;
    send({ type: "setMicrophoneEnabled", enabled: !muted });
  }, [bridge, muted, send]);

  useEffect(() => {
    if (!bridge) return;
    if (!cameraOn) {
      send({ type: "setCameraEnabled", enabled: false });
      return;
    }
    let cancelled = false;
    void requestCameraPermissionsAsync().then((permission) => {
      if (cancelled) return;
      if (!permission.granted) {
        setMediaError(VOICE_CAMERA_DENIED);
        if (stateRef.current.cameraOn) dispatch({ type: "toggle_camera" });
        return;
      }
      send({ type: "setCameraEnabled", enabled: true });
    });
    return () => {
      cancelled = true;
    };
  }, [bridge, cameraOn, send]);

  useEffect(() => {
    if (!bridge) return;
    send({ type: "setAppearance", theme, localAvatarUrl });
  }, [bridge, theme, localAvatarUrl, send]);

  useEffect(() => {
    if (!bridge) return;
    send({ type: "setPinned", identity: pinnedIdentity });
  }, [bridge, pinnedIdentity, send]);

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
  const toggleCamera = useCallback(() => {
    setMediaError(null);
    dispatch({ type: "toggle_camera" });
  }, []);
  const toggleMutedForMe = useCallback(
    (identity: string) => dispatch({ type: "toggle_muted_for_me", identity }),
    [],
  );
  const openParticipants = useCallback(() => setIsParticipantsOpen(true), []);
  const closeParticipants = useCallback(() => setIsParticipantsOpen(false), []);
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
      toggleCamera,
      setCallStage,
      toggleMutedForMe,
      pinnedIdentity,
      setPinnedIdentity,
      isParticipantsOpen,
      openParticipants,
      closeParticipants,
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
      toggleCamera,
      toggleMutedForMe,
      pinnedIdentity,
      isParticipantsOpen,
      openParticipants,
      closeParticipants,
      focusConnectedChannel,
      dismissNotice,
    ],
  );

  return (
    <VoiceSessionContext.Provider value={value}>
      {children}
      {bridge && VOICE_EMBED_URL ? (
        <View
          ref={overlayRef}
          style={StyleSheet.absoluteFill}
          pointerEvents="box-none"
          onLayout={() =>
            overlayRef.current?.measureInWindow((x, y) =>
              setOverlayOrigin((origin) =>
                origin.x === x && origin.y === y ? origin : { x, y },
              ),
            )
          }
        >
          <View
            pointerEvents={callStage && isEmbedPainted ? "auto" : "none"}
            style={
              callStage
                ? {
                    position: "absolute",
                    left: callStage.x - overlayOrigin.x,
                    top: callStage.y - overlayOrigin.y,
                    width: callStage.width,
                    height: callStage.height,
                    opacity: isEmbedPainted ? 1 : 0,
                  }
                : styles.hidden
            }
          >
            <WebView<object>
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
              style={{ backgroundColor: colors.bgChat }}
            />
          </View>
        </View>
      ) : null}
    </VoiceSessionContext.Provider>
  );
}

const styles = StyleSheet.create({
  hidden: { position: "absolute", width: 1, height: 1, opacity: 0 },
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
