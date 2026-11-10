import {
  voiceAvatarOf,
  type VoiceParticipantProfile,
} from "@discordia/client-shared";

import { useCallback, useEffect, useMemo, useState } from "react";

import { loadVoiceProfile } from "./voice-profiles";

export function useVoiceProfiles(userIds: readonly string[]) {
  const [byId, setById] = useState<
    Readonly<Record<string, VoiceParticipantProfile>>
  >({});
  const idsKey = userIds.join("|");

  useEffect(() => {
    let cancelled = false;
    const ids = idsKey === "" ? [] : idsKey.split("|");
    for (const id of ids) {
      void loadVoiceProfile(id).then((profile) => {
        if (cancelled || !profile) return;
        setById((current) =>
          current[id] === profile ? current : { ...current, [id]: profile },
        );
      });
    }
    return () => {
      cancelled = true;
    };
  }, [idsKey]);

  const profiles = useMemo(() => Object.values(byId), [byId]);
  const avatarOf = useCallback(
    (identity: string) => voiceAvatarOf(profiles, identity),
    [profiles],
  );

  return { profiles, avatarOf };
}
