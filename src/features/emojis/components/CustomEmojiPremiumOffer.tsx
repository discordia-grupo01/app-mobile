import {
  CUSTOM_EMOJI_PREMIUM_OFFER_COPY,
  CUSTOM_EMOJI_REACTION_OFFER_COPY,
} from "@discordia/client-shared";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { useThemeColors } from "../../../theme/theme-context";
import { DiscordiaPremiumIcon } from "../../billing/components/shared/DiscordiaIcons";

export type CustomEmojiOfferVariant = "compose" | "reaction";

const COPY = {
  compose: CUSTOM_EMOJI_PREMIUM_OFFER_COPY,
  reaction: CUSTOM_EMOJI_REACTION_OFFER_COPY,
} as const;

interface CustomEmojiPremiumOfferProps {
  onOpenPremium: () => void;
  variant?: CustomEmojiOfferVariant;
  onClose?: () => void;
}

export function CustomEmojiPremiumOffer({
  onOpenPremium,
  variant = "compose",
  onClose,
}: CustomEmojiPremiumOfferProps) {
  const colors = useThemeColors();
  const copy = COPY[variant];

  return (
    <View className="relative mt-2 gap-2 rounded-xl border border-amber/35 bg-surface-modal p-3.5">
      {onClose ? (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Cerrar oferta"
          className="absolute top-2.5 right-2.5 p-1"
        >
          <Feather name="x" size={14} color={colors.textMuted} />
        </TouchableOpacity>
      ) : null}

      <View className={onClose ? "pr-6" : undefined}>
        <Text className="text-[13px] font-bold text-content">{copy.title}</Text>
        <Text className="mt-0.5 text-[12px] leading-4 text-content-muted">
          {copy.detail}
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onOpenPremium}
        className="flex-row items-center gap-1.5 self-start py-0.5"
      >
        <DiscordiaPremiumIcon size={14} />
        <Text className="text-[12px] font-bold text-amber">{copy.cta}</Text>
      </TouchableOpacity>
    </View>
  );
}
