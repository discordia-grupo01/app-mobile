import { useEffect } from "react";

import { startRinging, stopRinging } from "./ringtone";

// Con la app abierta el push de llamada no suena (el handler lo silencia),
// así que el ringtone lo reproduce la app en loop mientras la llamada entra.
export function useIncomingCallRingtone(isRinging: boolean) {
  useEffect(() => {
    if (!isRinging) return;
    const player = startRinging();
    return () => stopRinging(player);
  }, [isRinging]);
}
