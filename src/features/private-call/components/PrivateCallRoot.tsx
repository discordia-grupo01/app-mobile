import type { ReactNode } from "react";

import { useAuth } from "../../auth/auth-context";
import { PrivateCallProvider } from "../private-call-context";
import { useCallPartnerResolver } from "../useCallPartnerResolver";
import { PrivateCallBanner } from "./PrivateCallBanner";
import { PrivateCallNotice } from "./PrivateCallNotice";
import { PrivateCallPushActions } from "./PrivateCallPushActions";
import { PrivateCallScreen } from "./PrivateCallScreen";

export function PrivateCallRoot({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const resolvePartner = useCallPartnerResolver();

  return (
    <PrivateCallProvider
      currentUserId={user?.id ?? null}
      resolvePartner={resolvePartner}
    >
      {children}
      <PrivateCallBanner />
      <PrivateCallNotice />
      <PrivateCallScreen />
      <PrivateCallPushActions />
    </PrivateCallProvider>
  );
}
