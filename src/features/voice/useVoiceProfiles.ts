import {
  voiceAvatarOf,
  type VoiceParticipantProfile,
} from "@discordia/client-shared";

import { useCallback, useEffect, useMemo, useState } from "react";

import { changeBus } from "../../lib/changeBus";

import { forgetVoiceProfile, loadVoiceProfile } from "./voice-profiles";

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

  useEffect(() => {
    const ids = idsKey === "" ? [] : idsKey.split("|");
    let cancelled = false;
    const unsubscribe = changeBus.subscribe(
      { resources: ["profile"] },
      ({ user_id: userId }) => {
        if (!userId || !ids.includes(userId)) return;
        forgetVoiceProfile(userId);
        void loadVoiceProfile(userId).then((profile) => {
          if (cancelled || !profile) return;
          setById((current) => ({ ...current, [userId]: profile }));
        });
      },
    );
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [idsKey]);

  const profiles = useMemo(() => Object.values(byId), [byId]);
  const avatarOf = useCallback(
    (identity: string) => voiceAvatarOf(profiles, identity),
    [profiles],
  );

  return { profiles, avatarOf };
}
