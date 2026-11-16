import { type ServerSummary, type UnreadFlags } from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { ServerRail } from "../features/servers/components/rail/ServerRail";
import { UserProfileBar } from "../features/servers/components/account/UserProfileBar";
import { useThemeColors } from "../theme/theme-context";

interface ServerPickerScreenProps {
  servers: ServerSummary[];
  userName?: string | null;
  unreadDmCount?: number;
  unreadByServer?: Record<string, UnreadFlags>;
  onSelectServer: (serverId: string) => void;
  onOpenDirectMessages: () => void;
  onAddServer: () => void;
  onLogout: () => void;
}

export function ServerPickerScreen({
  servers,
  userName,
  unreadDmCount,
  unreadByServer,
  onSelectServer,
  onOpenDirectMessages,
  onAddServer,
  onLogout,
}: ServerPickerScreenProps) {
  const colors = useThemeColors();
  return (
    <View className="flex-1 flex-row bg-surface-sunken">
      <ServerRail
        servers={servers}
        activeServerId={null}
        isDirectMessagesActive={false}
        unreadDmCount={unreadDmCount}
        unreadByServer={unreadByServer}
        onOpenDirectMessages={onOpenDirectMessages}
        onSelectServer={onSelectServer}
        onAddServer={onAddServer}
      />

      <View className="flex-1 justify-between">
        <View className="flex-1 items-center justify-center px-7">
          <View className="w-16 h-16 rounded-[32px] items-center justify-center bg-surface-input mb-4.5">
            <Feather name="compass" size={28} color={colors.textSubtle} />
          </View>
          <Text className="text-[12px] font-bold tracking-[1.5px] text-content-subtle mb-2.5">
            TUS SERVIDORES
          </Text>
          <Text className="text-[19px] font-bold text-content text-center mb-2">
            Elegí un servidor de la barra lateral
          </Text>
          <Text className="text-[14px] text-content-muted text-center">
            O sumá uno nuevo con el botón de abajo.
          </Text>
        </View>

        <UserProfileBar userName={userName} onLogout={onLogout} />
      </View>
    </View>
  );
}
