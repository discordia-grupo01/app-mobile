import type { Boost } from "@discordia/client-shared";

import { useCallback, useState } from "react";

import { changeBus } from "../../../../lib/changeBus";
import { removeBoost } from "../../api";

export function useRemoveBoost(onRemoved: () => void) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = useCallback(
    async (boost: Boost): Promise<boolean> => {
      setPending(true);
      setError(null);
      const result = await removeBoost(boost.id);
      setPending(false);
      if (!result.ok) {
        setError(result.message);
        return false;
      }
      onRemoved();
      changeBus.publish({ resource: "server", server_id: boost.server_id });
      return true;
    },
    [onRemoved],
  );

  const clearError = useCallback(() => setError(null), []);

  return { pending, error, remove, clearError };
}
