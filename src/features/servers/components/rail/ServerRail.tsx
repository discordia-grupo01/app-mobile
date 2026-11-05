import { isServerMuted, type ServerSummary } from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { resolveServerIconUrl } from "../../api";
import { cn } from "../../../../lib/cn";
import { useOptionalNotificationSettings } from "../../../notifications/NotificationSettingsContext";
import { useTheme, useThemeColors } from "../../../../theme/theme-context";
import { Avatar } from "../../../../components/ui/Avatar";
import { CountBadge } from "../../../../components/ui/CountBadge";

export const RAIL_WIDTH = 72;

interface ServerRailProps {
  servers: ServerSummary[];
  activeServerId: string | null;
  isDirectMessagesActive: boolean;
  unreadDmCount?: number;
  unreadMentionsByServer?: Record<string, number>;
  onOpenDirectMessages: () => void;
  onSelectServer: (serverId: string) => void;
  onAddServer: () => void;
}

function ServerRailIcon({
  item,
  active,
  unreadMentions,
  onPress,
}: {
  item: ServerSummary;
  active: boolean;
  unreadMentions: number;
  onPress: () => void;
}) {
  const notificationSettings = useOptionalNotificationSettings();
  const isMuted =
    notificationSettings !== null &&
    isServerMuted(notificationSettings.settings, item.id);
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      className={cn("items-center justify-center", isMuted && "opacity-60")}
      style={styles.iconWrap}
    >
      {active ? (
        <View className="absolute left-0 top-[50%] -mt-3 w-1 h-6 rounded-xs bg-server-pill" />
      ) : null}
      <Avatar
        name={item.name}
        uri={resolveServerIconUrl(item.icon_url)}
        size={48}
        borderRadius={active ? 16 : 24}
      />
      {unreadMentions > 0 ? (
        <CountBadge
          count={unreadMentions}
          label={`${unreadMentions} menciones sin leer en ${item.name}`}
          className="absolute bottom-0 right-2 border-2 border-surface-servers"
        />
      ) : null}
    </TouchableOpacity>
  );
}

export function ServerRail({
  servers,
  activeServerId,
  isDirectMessagesActive,
  unreadDmCount = 0,
  unreadMentionsByServer = {},
  onOpenDirectMessages,
  onSelectServer,
  onAddServer,
}: ServerRailProps) {
  const { theme } = useTheme();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="grow-0 bg-surface-servers"
      style={styles.rail}
      contentContainerClassName="items-center gap-2.5 py-3"
      contentContainerStyle={{ paddingTop: insets.top + 12 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="relative">
        <TouchableOpacity
          onPress={onOpenDirectMessages}
          className={cn(
            "w-12 h-12 items-center justify-center",
            isDirectMessagesActive
              ? "bg-rail-active-bg rounded-2xl"
              : "bg-rail-surface rounded-3xl",
          )}
          accessibilityLabel="Mensajes directos"
        >
          <Feather
            name="home"
            size={20}
            color={
              isDirectMessagesActive ? colors.railActiveText : colors.onAccent
            }
            style={isDirectMessagesActive ? undefined : { opacity: 0.7 }}
          />
        </TouchableOpacity>
        {unreadDmCount > 0 && !isDirectMessagesActive ? (
          <CountBadge
            count={unreadDmCount}
            label={`${unreadDmCount} conversaciones sin leer`}
            className="absolute -right-0.5 -top-0.5 border-2 border-surface-servers"
          />
        ) : null}
      </View>

      <View
        className="w-8 h-px my-0.5"
        style={{
          backgroundColor:
            theme === "light" ? colors.borderOnAccent : colors.borderStrong,
        }}
      />

      {servers.map((item) => (
        <ServerRailIcon
          key={item.id}
          item={item}
          active={item.id === activeServerId}
          unreadMentions={unreadMentionsByServer[item.id] ?? 0}
          onPress={() => onSelectServer(item.id)}
        />
      ))}

      <TouchableOpacity
        onPress={onAddServer}
        className="w-12 h-12 rounded-3xl items-center justify-center bg-rail-surface"
        accessibilityLabel="Agregar servidor"
      >
        <Feather name="plus" size={20} color={colors.success} />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  rail: {
    width: RAIL_WIDTH,
  },
  iconWrap: {
    width: RAIL_WIDTH,
  },
});
