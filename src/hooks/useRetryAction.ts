import { useCallback, useState } from "react";

/** Minimo que se muestra "reintentando", para que un fallo instantaneo no parezca que no paso nada. */
const MIN_RETRY_FEEDBACK_MS = 600;

/** Un reintento con su estado: `isRetrying` hasta que responde (y al menos un instante). */
export function useRetryAction(action: () => void | Promise<unknown>) {
  const [isRetrying, setIsRetrying] = useState(false);

  const run = useCallback(async () => {
    setIsRetrying(true);
    try {
      await Promise.all([
        action(),
        new Promise<void>((resolve) =>
          setTimeout(resolve, MIN_RETRY_FEEDBACK_MS),
        ),
      ]);
    } finally {
      setIsRetrying(false);
    }
  }, [action]);

  return { isRetrying, run };
}
