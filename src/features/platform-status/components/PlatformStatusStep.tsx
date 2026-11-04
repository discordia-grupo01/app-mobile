import { ActivityIndicator, View } from "react-native";

import { FormErrorBanner } from "../../../components/ui/FormErrorBanner";
import { useThemeColors } from "../../../theme/theme-context";
import { usePlatformStatus } from "../hooks/usePlatformStatus";
import { PlatformStatusDetails } from "./PlatformStatusDetails";

export function PlatformStatusStep() {
  const colors = useThemeColors();
  const { state } = usePlatformStatus();

  if (state.phase === "loading") {
    return (
      <View className="items-center py-16">
        <ActivityIndicator color={colors.textMuted} />
      </View>
    );
  }

  if (state.phase === "error") {
    return (
      <View className="px-4.5 pt-5">
        <FormErrorBanner message={state.message} />
      </View>
    );
  }

  return (
    <View className="px-4.5 pt-5">
      <PlatformStatusDetails {...state.data} />
    </View>
  );
}
