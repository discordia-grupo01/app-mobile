import { type ServerSummary, type UnreadFlags } from "@discordia/client-shared";

import { View } from "react-native";

import { UserProfileBar } from "../features/servers/components/account/UserProfileBar";
import { ServerRail } from "../features/servers/components/rail/ServerRail";
import { ServerSuspendedNotice } from "../features/servers/components/server/ServerSuspendedNotice";

interface ServerSuspendedScreenProps {
  server: ServerSummary;
  servers: ServerSummary[];
  userName?: string | null;
  unreadDmCount?: number;
  unreadByServer?: Record<string, UnreadFlags>;
  onSelectServer: (serverId: string) => void;
  onOpenDirectMessages: () => void;
  onAddServer: () => void;
  onLogout: () => void;
}

export function ServerSuspendedScreen({
  server,
  servers,
  userName,
  unreadDmCount,
  unreadByServer,
  onSelectServer,
  onOpenDirectMessages,
  onAddServer,
  onLogout,
}: ServerSuspendedScreenProps) {
  return (
    <View className="flex-1 flex-row bg-surface-sunken">
      <ServerRail
        servers={servers}
        activeServerId={server.id}
        isDirectMessagesActive={false}
        unreadDmCount={unreadDmCount}
        unreadByServer={unreadByServer}
        onOpenDirectMessages={onOpenDirectMessages}
        onSelectServer={onSelectServer}
        onAddServer={onAddServer}
      />

      <View className="flex-1 justify-between">
        <ServerSuspendedNotice />
        <UserProfileBar userName={userName} onLogout={onLogout} />
      </View>
    </View>
  );
}
