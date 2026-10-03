import {
  channelWelcomeSubtitle,
  channelWelcomeTitle,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

export function ChannelWelcome({ channelName }: { channelName: string }) {
  return (
    <View className="mb-2 px-4 pt-4">
      <View className="mb-3 h-14 w-14 items-center justify-center rounded-[28px] bg-accent">
        <Feather name="hash" size={28} color="#ffffff" />
      </View>
      <Text className="mb-1 text-[22px] font-bold text-content">
        {channelWelcomeTitle(channelName)}
      </Text>
      <Text className="text-[14px] text-content-muted">
        {channelWelcomeSubtitle(channelName)}
      </Text>
    </View>
  );
}
