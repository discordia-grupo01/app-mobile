import { useCallback } from "react";

import type { PushCallAction } from "../../push/callActions";
import { usePushCallAction } from "../../push/notification-handler";
import { useOptionalPrivateCall } from "../private-call-context";

export function PrivateCallPushActions() {
  const privateCall = useOptionalPrivateCall();
  const acceptFromPush = privateCall?.acceptFromPush;
  const declineFromPush = privateCall?.declineFromPush;

  const handleAction = useCallback(
    (action: PushCallAction) => {
      if (action.type === "accept") {
        acceptFromPush?.(action.callId, action.callerId);
        return;
      }
      declineFromPush?.(action.callId);
    },
    [acceptFromPush, declineFromPush],
  );

  usePushCallAction(handleAction);
  return null;
}
