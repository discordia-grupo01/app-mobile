import {
  VOICE_CONNECT_FORBIDDEN,
  VOICE_NOT_IMPLEMENTED,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { cn } from "../../../../lib/cn";
import { useThemeColors } from "../../../../theme/theme-context";

interface VoiceChannelPlaceholderProps {
  name: string;
  canConnect: boolean;
}

export function VoiceChannelPlaceholder({
  name,
  canConnect,
}: VoiceChannelPlaceholderProps) {
  const colors = useThemeColors();
  return (
    <View className="flex-1 items-center justify-center gap-3.5 px-7">
      <View
        className={cn(
          "w-16 h-16 rounded-[32px] items-center justify-center",
          canConnect ? "bg-accent" : "bg-surface-raised",
        )}
      >
        <Feather
          name={canConnect ? "volume-2" : "volume-x"}
          size={30}
          color={canConnect ? colors.onAccent : colors.danger}
        />
      </View>
      <Text className="text-[20px] font-bold text-content text-center">
        {`Canal de voz: ${name}`}
      </Text>
      <Text className="text-[15px] leading-[21px] text-content-muted text-center max-w-80">
        {canConnect ? VOICE_NOT_IMPLEMENTED : VOICE_CONNECT_FORBIDDEN}
      </Text>
    </View>
  );
}
