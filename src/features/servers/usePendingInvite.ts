import { useCallback, useEffect, useState } from "react";
import { Linking } from "react-native";

import { getInviteCode, subscribeToInviteLinks } from "../../lib/invite-links";

/**
 * El código del último link de invitación con el que se abrió la app. Vive
 * arriba de todo para no perderlo si llega con la sesión cerrada: se usa
 * recién cuando el home está montado.
 */
export function usePendingInvite() {
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Linking.getInitialURL()
      .then((url) => {
        if (cancelled || !url) return;
        const initialCode = getInviteCode(url);
        if (initialCode) setCode(initialCode);
      })
      .catch(() => {});
    const unsubscribe = subscribeToInviteLinks(setCode);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const clear = useCallback(() => setCode(null), []);

  return { code, clear };
}
