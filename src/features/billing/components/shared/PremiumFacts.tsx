import { BILLING_COPY } from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { useThemeColors } from "../../../../theme/theme-context";

export function PremiumFacts() {
  const colors = useThemeColors();

  return (
    <View className="gap-2.5 border-t border-line pt-5">
      {BILLING_COPY.showcaseFacts.map((fact) => (
        <View key={fact} className="flex-row items-start gap-2.5">
          <Feather
            name="check"
            size={15}
            color={colors.sky}
            style={{ marginTop: 2 }}
          />
          <Text className="flex-1 text-[13px] leading-[19px] text-content-muted">
            {fact}
          </Text>
        </View>
      ))}
    </View>
  );
}
