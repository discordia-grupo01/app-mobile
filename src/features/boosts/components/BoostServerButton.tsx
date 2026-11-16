import { BOOST_SERVER_LABEL } from "@discordia/client-shared";
import { Text, TouchableOpacity, View } from "react-native";

import { cn } from "../../../lib/cn";
import { BoostActionIcon } from "./BoostActionIcon";

interface BoostServerButtonProps {
  onPress: () => void;
  fullWidth?: boolean;
}

export function BoostServerButton({
  onPress,
  fullWidth = false,
}: BoostServerButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className={cn(
        "flex-row items-center gap-1.5 rounded-xl bg-accent",
        fullWidth
          ? "justify-center self-stretch py-2.5 px-3"
          : "self-start py-1.5 pl-1.5 pr-3",
      )}
      accessibilityRole="button"
      accessibilityLabel={BOOST_SERVER_LABEL}
    >
      <View className="h-6 w-6 items-center justify-center rounded-lg bg-surface-modal">
        <BoostActionIcon size={18} />
      </View>
      <Text className="font-display text-xs font-bold text-on-accent">
        {BOOST_SERVER_LABEL}
      </Text>
    </TouchableOpacity>
  );
}
