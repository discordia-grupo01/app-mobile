import { useCallback, useState } from "react";

import { changeBus } from "../../lib/changeBus";
import { setVanityCode } from "./api";

export function useVanityUrl(serverId: string, vanityCode: string | null) {
  const [savedCode, setSavedCode] = useState(vanityCode);
  const [lastVanityCode, setLastVanityCode] = useState(vanityCode);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  if (vanityCode !== lastVanityCode) {
    setLastVanityCode(vanityCode);
    setSavedCode(vanityCode);
  }

  const save = useCallback(
    async (code: string | null): Promise<boolean> => {
      setPending(true);
      setError("");
      const result = await setVanityCode(serverId, code);
      setPending(false);
      if (!result.ok) {
        setError(result.message);
        return false;
      }
      setSavedCode(result.vanity_code);
      changeBus.publish({ resource: "server", server_id: serverId });
      return true;
    },
    [serverId],
  );

  const clearError = useCallback(() => setError(""), []);

  return { savedCode, pending, error, save, clearError };
}
