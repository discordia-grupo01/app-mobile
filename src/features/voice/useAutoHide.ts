import { useCallback, useEffect, useState } from "react";

import { EXPANDED_OVERLAY_HIDE_MS } from "./expanded-call";

export function useAutoHide() {
  const [shown, setShown] = useState({ visible: true, at: 0 });

  useEffect(() => {
    if (!shown.visible) return;
    const timer = setTimeout(
      () => setShown((current) => ({ ...current, visible: false })),
      EXPANDED_OVERLAY_HIDE_MS,
    );
    return () => clearTimeout(timer);
  }, [shown]);

  const toggle = useCallback(
    () =>
      setShown((current) => ({
        visible: !current.visible,
        at: current.at + 1,
      })),
    [],
  );

  return { isVisible: shown.visible, toggle };
}
