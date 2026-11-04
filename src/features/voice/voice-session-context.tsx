import {
  initialVoiceSessionState,
  ownerOfScreenShareIdentity,
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
  voiceScreenTileName,
  voiceSessionReducer,
  type VoiceSessionState,
  type VoiceChannelTarget,
  type PrivateCallCredentials,
  type PrivateCallTarget,
  voiceTargetKey,
  withParticipantProfiles,
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
import { ExpandedCallOverlay } from "./components/call/ExpandedCallOverlay";
import { channelTargetOf } from "./channel-target";
import { participantProfilesOf } from "./participant-profiles";
import { isNativeScreenShareAvailable } from "./screen-share/livekit-native";
import { useNativeScreenShare } from "./screen-share/useNativeScreenShare";
import { useExpandedCall } from "./useExpandedCall";

type EmbedWebView = WebView<object>;

const LEAVE_DISCONNECT_TIMEOUT_MS = 3000;

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
  join: (target: VoiceChannelTarget) => void;
  connectWith: (
    target: PrivateCallTarget,
    credentials: PrivateCallCredentials,
  ) => void;
  leave: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  /**
   * Solo en el APK de Android, con la llamada (canal o privada) conectada y
   * permiso de hablar.
   */
  canScreenShare: boolean;
  toggleScreenShare: () => void;
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
  const profiles = useMemo(
    () =>
      participantProfilesOf(
        state.target,
        user
          ? { id: user.id, name: user.name, avatarUrl: localAvatarUrl }
          : null,
      ),
    [state.target, user, localAvatarUrl],
  );
  const [bridge, setBridge] = useState<BridgeSession | null>(null);
  const [isEmbedPainted, setIsEmbedPainted] = useState(false);
  const webViewRef = useRef<EmbedWebView>(null);
  const isReadyRef = useRef(false);
  const pendingRef = useRef<VoiceBridgeCommand[]>([]);
  const sentMutedForMeRef = useRef<readonly string[]>([]);
  const attemptRef = useRef(0);
  const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  const screenShare = useNativeScreenShare(
    useCallback((notice: string | null) => {
      if (notice) setMediaError(notice);
      if (stateRef.current.screenSharing) {
        dispatch({ type: "toggle_screen_share" });
      }
    }, []),
  );

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

  const {
    expandedIdentity,
    expand: expandParticipant,
    collapse: collapseExpanded,
  } = useExpandedCall({
    participants: state.participants,
    isBridgeOpen: bridge !== null,
    send,
  });
  // Se amplia un tile: la camara de alguien o su pantalla (`<id>:screen`).
  const expandedScreenOwner = expandedIdentity
    ? ownerOfScreenShareIdentity(expandedIdentity)
    : null;
  const expandedOwnerId = expandedScreenOwner ?? expandedIdentity;
  const expandedParticipant = expandedOwnerId
    ? withParticipantProfiles(state.participants, profiles).find(
        (participant) => participant.identity === expandedOwnerId,
      )
    : undefined;

  const closeBridge = useCallback(() => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
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
    async (target: VoiceChannelTarget) => {
      if (!VOICE_EMBED_URL) return;
      if (
        channelTargetOf(stateRef.current.target)?.channelId === target.channelId
      )
        return;

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

  const connectWith = useCallback(
    async (target: PrivateCallTarget, credentials: PrivateCallCredentials) => {
      if (!VOICE_EMBED_URL) return;
      const current = stateRef.current.target;
      if (current && voiceTargetKey(current) === voiceTargetKey(target)) return;

      const previousChannelId = channelTargetOf(current)?.channelId;
      if (previousChannelId) void leaveVoiceSession(previousChannelId);

      closeBridge();
      const attempt = attemptRef.current;
      dispatch({ type: "join_requested", target });

      const permission = await requestRecordingPermissionsAsync();
      if (attempt !== attemptRef.current) return;
      if (!permission.granted) {
        setMediaError(VOICE_MIC_DENIED);
        if (!stateRef.current.muted) dispatch({ type: "toggle_mute" });
      }
      setBridge({ url: credentials.url, token: credentials.token });
    },
    [closeBridge],
  );

  const disconnectThenClose = useCallback(() => {
    send({ type: "disconnect" });
    dispatch({ type: "ended", notice: null });
    setIsEmbedPainted(false);
    leaveTimeoutRef.current = setTimeout(
      closeBridge,
      LEAVE_DISCONNECT_TIMEOUT_MS,
    );
  }, [send, closeBridge]);

  useEffect(() => {
    const leaveTimeout = leaveTimeoutRef;
    return () => {
      if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
    };
  }, []);

  const leave = useCallback(async () => {
    const channelId = channelTargetOf(stateRef.current.target)?.channelId;
    if (isReadyRef.current && !leaveTimeoutRef.current) disconnectThenClose();
    else end(null);
    if (!channelId) return;

    const result = await leaveVoiceSession(channelId);
    setLeaveSettledCount((count) => count + 1);
    if (!result.ok && stateRef.current.target === null) {
      dispatch({ type: "ended", notice: result.message });
    }
  }, [end, disconnectThenClose]);

  const handleEvent = useCallback(
    (event: VoiceBridgeEvent) => {
      if (leaveTimeoutRef.current) {
        if (isLeaveSettledEvent(event)) closeBridge();
        return;
      }
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
          if (!event.allowed && stateRef.current.screenSharing) {
            dispatch({ type: "toggle_screen_share" });
          }
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
        case "expandRequested":
          if (event.identity) expandParticipant(event.identity);
          else collapseExpanded();
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
    [end, send, closeBridge, expandParticipant, collapseExpanded],
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

  const { muted, cameraOn, screenSharing, mutedForMe, target } = state;
  const { start: startScreenShare, stop: stopScreenShare } = screenShare;

  // Corre mientras haya llamada y pantalla compartida: salir, cambiar de
  // llamada o apagarla la corta (el reducer apaga `screenSharing` en esos casos).
  useEffect(() => {
    if (!bridge || !screenSharing || !target) return;
    void startScreenShare(target);
    return stopScreenShare;
  }, [bridge, screenSharing, target, startScreenShare, stopScreenShare]);

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
    send({ type: "setAppearance", theme, localAvatarUrl, canExpand: true });
  }, [bridge, theme, localAvatarUrl, send]);

  useEffect(() => {
    if (!bridge) return;
    send({ type: "setParticipantProfiles", profiles });
  }, [bridge, profiles, send]);

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
  const toggleScreenShare = useCallback(() => {
    setMediaError(null);
    dispatch({ type: "toggle_screen_share" });
  }, []);
  const canScreenShare =
    isNativeScreenShareAvailable &&
    target !== null &&
    state.status === "connected" &&
    state.canSpeak;
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
    (target: VoiceChannelTarget) => void join(target),
    [join],
  );
  const startConnectWith = useCallback(
    (target: PrivateCallTarget, credentials: PrivateCallCredentials) =>
      void connectWith(target, credentials),
    [connectWith],
  );
  const startLeave = useCallback(() => void leave(), [leave]);

  const value = useMemo(
    () => ({
      state,
      isAvailable: VOICE_EMBED_URL !== null,
      mediaError,
      leaveSettledCount,
      join: startJoin,
      connectWith: startConnectWith,
      leave: startLeave,
      toggleMute,
      toggleCamera,
      canScreenShare,
      toggleScreenShare,
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
      startConnectWith,
      startLeave,
      toggleMute,
      toggleCamera,
      canScreenShare,
      toggleScreenShare,
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
            pointerEvents={
              callStage && isEmbedPainted && !expandedParticipant
                ? "auto"
                : "none"
            }
            style={
              expandedParticipant
                ? StyleSheet.absoluteFill
                : callStage
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
              // En la llamada privada la pagina carga escondida en 1x1 px. Con
              // el "ajustar a la pantalla" de Android ese zoom quedaba fijo y
              // la grilla se veia chica al mostrarla.
              scalesPageToFit={false}
              setBuiltInZoomControls={false}
              mediaCapturePermissionGrantType="grant"
              javaScriptEnabled
              style={{ backgroundColor: colors.bgChat }}
            />
          </View>
          {expandedParticipant ? (
            <ExpandedCallOverlay
              key={expandedIdentity}
              name={
                expandedScreenOwner
                  ? voiceScreenTileName(
                      expandedParticipant.name,
                      expandedParticipant.isLocal,
                    )
                  : expandedParticipant.name
              }
              source={expandedScreenOwner ? "screen" : "camera"}
              onExit={collapseExpanded}
            />
          ) : null}
        </View>
      ) : null}
    </VoiceSessionContext.Provider>
  );
}

function isLeaveSettledEvent(event: VoiceBridgeEvent): boolean {
  return (
    event.type === "disconnected" ||
    event.type === "error" ||
    (event.type === "status" && event.status === "idle")
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
