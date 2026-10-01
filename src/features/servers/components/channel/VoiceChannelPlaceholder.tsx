import { VOICE_NOT_IMPLEMENTED } from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

export function VoiceChannelPlaceholder({ name }: { name: string }) {
  return (
    <View className="flex-1 items-center justify-center gap-3.5 px-7">
      <View className="w-16 h-16 rounded-[32px] items-center justify-center bg-accent">
        <Feather name="volume-2" size={30} color="#ffffff" />
      </View>
      <Text className="text-[20px] font-bold text-content text-center">
        {`Canal de voz: ${name}`}
      </Text>
      <Text className="text-[15px] leading-[21px] text-content-muted text-center max-w-80">
        {VOICE_NOT_IMPLEMENTED}
      </Text>
    </View>
  );
}
