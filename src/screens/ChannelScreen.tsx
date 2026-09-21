import {
  type Channel,
  CHANNEL_START_NOTICE,
  VOICE_NOT_IMPLEMENTED,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MembersSidebar } from "../features/servers/components/channel/MembersSidebar";
import { useThemeColors } from "../theme/theme-context";

interface ChannelScreenProps {
  channel: Channel;
  serverId: string;
  authToken?: string | null;
  currentUserId?: string | null;
  isOwner?: boolean;
  onBack: () => void;
}

export function ChannelScreen({
  channel,
  serverId,
  authToken,
  currentUserId,
  isOwner = false,
  onBack,
}: ChannelScreenProps) {
  const colors = useThemeColors();
  const isText = channel.kind === "text";
  const insets = useSafeAreaInsets();
  const [isMembersVisible, setIsMembersVisible] = useState(false);

  return (
    <View className="flex-1 bg-surface">
      <View
        className="flex-row items-center gap-3 min-h-15 px-3 border-b border-b-line"
        style={{ paddingTop: insets.top }}
      >
        <TouchableOpacity
          onPress={onBack}
          className="w-8.5 h-8.5 items-center justify-center"
          accessibilityLabel="Volver"
        >
          <Feather name="arrow-left" size={22} color={colors.textMuted} />
        </TouchableOpacity>
        <Feather
          name={isText ? "hash" : "volume-2"}
          size={19}
          color={colors.textSubtle}
        />
        <Text
          className="flex-1 text-[17px] font-bold text-content"
          numberOfLines={1}
        >
          {channel.name}
        </Text>
        <TouchableOpacity
          onPress={() => setIsMembersVisible(true)}
          className="w-8.5 h-8.5 items-center justify-center"
          accessibilityLabel="Ver miembros"
          accessibilityRole="button"
        >
          <Feather name="users" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <MembersSidebar
        visible={isMembersVisible}
        serverId={serverId}
        currentUserId={currentUserId}
        authToken={authToken}
        isOwner={isOwner}
        onClose={() => setIsMembersVisible(false)}
      />

      <View className="flex-1 items-center justify-center gap-3.5 px-7">
        <View className="w-16 h-16 rounded-[32px] items-center justify-center bg-accent">
          <Feather
            name={isText ? "hash" : "volume-2"}
            size={30}
            color="#ffffff"
          />
        </View>
        <Text className="text-[20px] font-bold text-content text-center">
          {isText
            ? `Bienvenido a #${channel.name}`
            : `Canal de voz: ${channel.name}`}
        </Text>
        <Text className="text-[15px] leading-[21px] text-content-muted text-center max-w-80">
          {isText ? CHANNEL_START_NOTICE : VOICE_NOT_IMPLEMENTED}
        </Text>
      </View>

      {isText ? (
        <View className="m-4 mt-0 rounded-[10px] border border-line bg-surface-input px-4 py-[15px]">
          <Text className="text-[14px] text-content-subtle">
            El chat todavía no está disponible
          </Text>
        </View>
      ) : null}
    </View>
  );
}
