import {
  initialPrivateCallState,
  isPrivateCallBusy,
  parseAcceptedPrivateCall,
  parseEndedPrivateCall,
  parsePrivateCall,
  type PrivateCall,
  type PrivateCallEndReason,
  type PrivateCallPartner,
  privateCallReducer,
  type PrivateCallState,
  type PrivateCallTarget,
  voiceTargetKey,
} from "@discordia/client-shared";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";

import {
  acceptPrivateCall,
  finishPrivateCall,
  rejectPrivateCall,
  startPrivateCall,
} from "../voice/api";
import { connectPrivateCalls } from "../voice/socket";
import { useVoiceSession } from "../voice/voice-session-context";

interface PrivateCallValue {
  state: PrivateCallState;
  isMinimized: boolean;
  connectedAt: number | null;
  endReason: PrivateCallEndReason | null;
  start: (partner: PrivateCallPartner, conversationId: string) => void;
  accept: () => void;
  decline: () => void;
  acceptFromPush: (callId: string, callerId: string) => void;
  declineFromPush: (callId: string) => void;
  cancel: () => void;
  hangUp: () => void;
  minimize: () => void;
  restore: () => void;
  dismissNotice: () => void;
}

interface PrivateCallProviderProps {
  currentUserId: string | null;
  resolvePartner: (userId: string) => Promise<PrivateCallPartner>;
  children: ReactNode;
}

const PrivateCallContext = createContext<PrivateCallValue | null>(null);

function targetOf(
  call: PrivateCall,
  partner: PrivateCallPartner,
): PrivateCallTarget {
  return {
    kind: "private_call",
    callId: call.call_id,
    conversationId: call.conversation_id,
    partnerId: partner.id,
    partnerName: partner.name,
    partnerAvatarUrl: partner.avatarUrl,
  };
}

export function PrivateCallProvider({
  currentUserId,
  resolvePartner,
  children,
}: PrivateCallProviderProps) {
  const voice = useVoiceSession();
  const [state, dispatch] = useReducer(
    privateCallReducer,
    initialPrivateCallState,
  );
  const [isMinimized, setIsMinimized] = useState(false);
  const [connectedAt, setConnectedAt] = useState<number | null>(null);
  const [endReason, setEndReason] = useState<PrivateCallEndReason | null>(null);

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  const resolvePartnerRef = useRef(resolvePartner);
  useEffect(() => {
    resolvePartnerRef.current = resolvePartner;
  });
  const isCancelPendingRef = useRef(false);

  const callTarget = useMemo(
    () =>
      state.call && state.partner ? targetOf(state.call, state.partner) : null,
    [state.call, state.partner],
  );
  const callKey = callTarget ? voiceTargetKey(callTarget) : null;
  const voiceKey = voice.state.target
    ? voiceTargetKey(voice.state.target)
    : null;
  const isVoiceInCall = callKey !== null && voiceKey === callKey;

  useEffect(() => {
    if (!currentUserId) return;
    const endFromEvent = (payload: unknown) => {
      const call = parseEndedPrivateCall(payload);
      if (!call) return;
      if (stateRef.current.call?.call_id === call.call_id)
        setEndReason(call.reason);
      dispatch({ type: "ended", call });
    };

    return connectPrivateCalls(currentUserId, {
      incoming: (payload) => {
        const call = parsePrivateCall(payload);
        if (!call) return;
        if (isPrivateCallBusy(stateRef.current)) {
          void rejectPrivateCall(call.call_id);
          return;
        }
        void resolvePartnerRef
          .current(call.caller_id)
          .then((partner) => dispatch({ type: "incoming", call, partner }));
      },
      accepted: (payload) => {
        const call = parseAcceptedPrivateCall(payload);
        if (call) dispatch({ type: "accepted", call });
      },
      answered: (payload) => {
        const call = parsePrivateCall(payload);
        if (call)
          dispatch({ type: "answered_elsewhere", callId: call.call_id });
      },
      rejected: endFromEvent,
      missed: endFromEvent,
      ended: endFromEvent,
    });
  }, [currentUserId]);

  const { credentials, phase } = state;
  const [lastPhase, setLastPhase] = useState(phase);
  if (phase !== lastPhase) {
    setLastPhase(phase);
    if (phase === "idle") setIsMinimized(false);
    else setEndReason(null);
    // eslint-disable-next-line react-hooks/purity
    setConnectedAt(phase === "in_call" ? Date.now() : null);
  }

  const { connectWith, leave } = voice;
  useEffect(() => {
    if (phase !== "connecting" || !credentials || !callTarget) return;
    if (!isVoiceInCall) connectWith(callTarget, credentials);
  }, [phase, credentials, callTarget, isVoiceInCall, connectWith]);

  const voiceStatus = voice.state.status;
  useEffect(() => {
    if (phase === "connecting" && isVoiceInCall && voiceStatus === "connected")
      dispatch({ type: "connected" });
  }, [phase, isVoiceInCall, voiceStatus]);

  const wasInCallRef = useRef(false);
  useEffect(() => {
    const call = stateRef.current.call;
    if (isVoiceInCall) {
      wasInCallRef.current = true;
      return;
    }
    if (!wasInCallRef.current) return;
    wasInCallRef.current = false;
    if (call && stateRef.current.phase !== "idle") {
      void finishPrivateCall(call.call_id);
      dispatch({ type: "closed" });
    }
  }, [isVoiceInCall]);

  const lastCallKeyRef = useRef<string | null>(null);
  useEffect(() => {
    if (callKey) {
      lastCallKeyRef.current = callKey;
      return;
    }
    const finished = lastCallKeyRef.current;
    lastCallKeyRef.current = null;
    if (finished && voiceKey === finished) {
      wasInCallRef.current = false;
      leave();
    }
  }, [callKey, voiceKey, leave]);

  const start = useCallback(
    (partner: PrivateCallPartner, conversationId: string) => {
      if (isPrivateCallBusy(stateRef.current)) return;
      isCancelPendingRef.current = false;
      dispatch({ type: "start_requested", partner });
      void startPrivateCall(partner.id, conversationId).then((result) => {
        if (!result.ok) {
          if (!isCancelPendingRef.current)
            dispatch({ type: "failed", message: result.message });
          return;
        }
        if (isCancelPendingRef.current) {
          isCancelPendingRef.current = false;
          void rejectPrivateCall(result.call.call_id);
          return;
        }
        dispatch({ type: "started", call: result.call });
      });
    },
    [],
  );

  const accept = useCallback(() => {
    const { call, phase: current } = stateRef.current;
    if (!call || current !== "incoming") return;
    dispatch({ type: "accept_requested" });
    void acceptPrivateCall(call.call_id).then((result) =>
      dispatch(
        result.ok
          ? { type: "accepted", call: result.call }
          : { type: "failed", message: result.message },
      ),
    );
  }, []);

  const decline = useCallback(() => {
    const { call } = stateRef.current;
    if (call) void rejectPrivateCall(call.call_id);
    dispatch({ type: "closed" });
  }, []);

  const acceptFromPush = useCallback(
    (callId: string, callerId: string) => {
      const current = stateRef.current;
      if (current.call?.call_id === callId) {
        if (current.phase === "incoming") accept();
        return;
      }
      if (isPrivateCallBusy(current)) return;

      void Promise.all([
        resolvePartnerRef.current(callerId),
        acceptPrivateCall(callId),
      ]).then(([partner, result]) => {
        if (!result.ok) {
          dispatch({ type: "failed", message: result.message });
          return;
        }
        dispatch({ type: "incoming", call: result.call, partner });
        dispatch({ type: "accept_requested" });
        dispatch({ type: "accepted", call: result.call });
      });
    },
    [accept],
  );

  const declineFromPush = useCallback((callId: string) => {
    void rejectPrivateCall(callId);
    if (stateRef.current.call?.call_id === callId) dispatch({ type: "closed" });
  }, []);

  const cancel = useCallback(() => {
    const { call } = stateRef.current;
    if (call) void rejectPrivateCall(call.call_id);
    else isCancelPendingRef.current = true;
    dispatch({ type: "closed" });
  }, []);

  const hangUp = useCallback(() => {
    const { call } = stateRef.current;
    if (call) void finishPrivateCall(call.call_id);
    wasInCallRef.current = false;
    dispatch({ type: "closed" });
  }, []);

  const minimize = useCallback(() => setIsMinimized(true), []);
  const restore = useCallback(() => setIsMinimized(false), []);
  const dismissNotice = useCallback(
    () => dispatch({ type: "dismiss_notice" }),
    [],
  );

  const value = useMemo(
    () => ({
      state,
      isMinimized,
      connectedAt,
      endReason,
      start,
      accept,
      decline,
      acceptFromPush,
      declineFromPush,
      cancel,
      hangUp,
      minimize,
      restore,
      dismissNotice,
    }),
    [
      state,
      isMinimized,
      connectedAt,
      endReason,
      start,
      accept,
      decline,
      acceptFromPush,
      declineFromPush,
      cancel,
      hangUp,
      minimize,
      restore,
      dismissNotice,
    ],
  );

  return (
    <PrivateCallContext.Provider value={value}>
      {children}
    </PrivateCallContext.Provider>
  );
}

export function useOptionalPrivateCall(): PrivateCallValue | null {
  return useContext(PrivateCallContext);
}
