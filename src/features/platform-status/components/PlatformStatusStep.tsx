import { View } from "react-native";

import { FormErrorBanner } from "../../../components/ui/FormErrorBanner";
import { usePlatformStatus } from "../hooks/usePlatformStatus";
import { PlatformStatusDetails } from "./PlatformStatusDetails";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";

export function PlatformStatusStep() {
  const { state } = usePlatformStatus();

  if (state.phase === "loading") {
    return <LoadingSpinner />;
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
