import { type ServerSummary } from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { resolveServerIconUrl } from "../../api";
import { cn } from "../../../../lib/cn";
import { useThemeColors } from "../../../../theme/theme-context";
import { ServerAvatar } from "../ServerAvatar";

export const RAIL_WIDTH = 72;

interface ServerRailProps {
  servers: ServerSummary[];
  activeServerId: string | null;
  onSelectHome: () => void;
  onSelectServer: (serverId: string) => void;
  onAddServer: () => void;
}

function ServerRailIcon({
  item,
  active,
  onPress,
}: {
  item: ServerSummary;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      className="items-center justify-center"
      style={styles.iconWrap}
    >
      {active ? (
        <View className="absolute left-0 top-[50%] -mt-3 w-1 h-6 rounded-xs bg-white" />
      ) : null}
      <ServerAvatar
        name={item.name}
        uri={resolveServerIconUrl(item.icon_url)}
        size={48}
        borderRadius={active ? 16 : 24}
      />
    </TouchableOpacity>
  );
}

export function ServerRail({
  servers,
  activeServerId,
  onSelectHome,
  onSelectServer,
  onAddServer,
}: ServerRailProps) {
  const colors = useThemeColors();
  const isHomeActive = activeServerId === null;
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="grow-0 bg-surface-servers"
      style={styles.rail}
      contentContainerClassName="items-center gap-2.5 py-3"
      contentContainerStyle={{ paddingTop: insets.top + 12 }}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        onPress={onSelectHome}
        className={cn(
          "w-12 h-12 items-center justify-center",
          isHomeActive
            ? "bg-accent rounded-2xl"
            : "bg-surface-input rounded-3xl",
        )}
        accessibilityLabel="Inicio"
      >
        <Feather
          name="home"
          size={20}
          color={isHomeActive ? "#ffffff" : "rgba(255, 255, 255, 0.7)"}
        />
      </TouchableOpacity>

      <View className="w-8 h-px bg-line-strong my-0.5" />

      {servers.map((item) => (
        <ServerRailIcon
          key={item.id}
          item={item}
          active={item.id === activeServerId}
          onPress={() => onSelectServer(item.id)}
        />
      ))}

      <TouchableOpacity
        onPress={onAddServer}
        className="w-12 h-12 rounded-3xl items-center justify-center bg-surface-input"
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
