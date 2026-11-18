import { EMOJI_PREMIUM_REQUIRED_LABEL } from "@discordia/client-shared";
import { View } from "react-native";

import { cn } from "../../../lib/cn";
import { DiscordiaPremiumIcon } from "../../billing/components/shared/DiscordiaIcons";

interface EmojiPremiumBadgeProps {
  size?: number;
  className?: string;
}

export function EmojiPremiumBadge({
  size = 16,
  className,
}: EmojiPremiumBadgeProps) {
  return (
    <View
      accessible
      accessibilityLabel={EMOJI_PREMIUM_REQUIRED_LABEL}
      style={{ width: size, height: size }}
      className={cn(
        "items-center justify-center rounded-md border border-[#F0B232]/50 bg-surface-modal",
        className,
      )}
    >
      <DiscordiaPremiumIcon size={Math.round(size * 0.65)} />
    </View>
  );
}
