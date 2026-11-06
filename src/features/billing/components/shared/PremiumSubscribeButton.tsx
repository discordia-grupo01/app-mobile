import { Text, TouchableOpacity, View } from "react-native";

import { DiscordiaPremiumIcon, LOGO } from "./DiscordiaIcons";

interface PremiumSubscribeButtonProps {
  label: string;
  onPress: () => void;
}

export function PremiumSubscribeButton({
  label,
  onPress,
}: PremiumSubscribeButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="button"
      className="min-h-12 flex-row items-center justify-center gap-2 rounded-xl px-5 py-3"
      style={{ backgroundColor: LOGO.yellow }}
    >
      <View
        className="h-6 w-6 items-center justify-center rounded-md"
        style={{ backgroundColor: LOGO.deep }}
      >
        <DiscordiaPremiumIcon size={16} />
      </View>
      <Text className="text-sm font-bold" style={{ color: LOGO.deep }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
