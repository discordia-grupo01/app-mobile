import { useOptionalPrivateCall } from "../private-call-context";
import { useIncomingCallRingtone } from "../useIncomingCallRingtone";

export function PrivateCallRingtone() {
  const privateCall = useOptionalPrivateCall();
  useIncomingCallRingtone(privateCall?.state.phase === "incoming");
  return null;
}
