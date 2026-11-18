import { PREMIUM_BRAND_COLORS } from "@discordia/client-shared";
import { Text, TouchableOpacity } from "react-native";

import { DiscordiaPremiumIcon } from "./DiscordiaIcons";

interface PremiumTextLinkProps {
  label: string;
  onPress: () => void;
}

export function PremiumTextLink({ label, onPress }: PremiumTextLinkProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="link"
      hitSlop={8}
      className="flex-row items-center gap-1"
    >
      <DiscordiaPremiumIcon size={14} />
      <Text
        className="text-xs font-bold"
        style={{ color: PREMIUM_BRAND_COLORS.yellow }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
