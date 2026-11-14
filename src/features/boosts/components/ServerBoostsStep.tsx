import {
  BOOSTS_SECTION_DESCRIPTION,
  RETRY_LABEL,
  type ServerSummary,
} from "@discordia/client-shared";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

import { Button } from "../../../components/ui/Button";
import { FormErrorBanner } from "../../../components/ui/FormErrorBanner";
import { useThemeColors } from "../../../theme/theme-context";
import { useServerBoostSummary } from "../useServerBoostSummary";
import { BoostPerksTable } from "./BoostPerksTable";
import { BoostShowcase } from "./BoostShowcase";
import { BoostStatusCard } from "./BoostStatusCard";

export function ServerBoostsStep({ server }: { server: ServerSummary }) {
  const colors = useThemeColors();
  const { summary, loadError, retry } = useServerBoostSummary(server.id);

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-7 px-4.5 pt-5 pb-8"
    >
      <Text className="text-[14px] leading-5 text-content-muted">
        {BOOSTS_SECTION_DESCRIPTION}
      </Text>

      {summary ? (
        <>
          <BoostStatusCard summary={summary} />
          <BoostPerksTable level={summary.level} />
          <BoostShowcase server={server} level={summary.level} />
        </>
      ) : loadError ? (
        <View className="gap-3">
          <FormErrorBanner message={loadError} />
          <Button
            title={RETRY_LABEL}
            variant="secondary"
            onPress={() => void retry()}
          />
        </View>
      ) : (
        <View className="items-center py-6">
          <ActivityIndicator size="small" color={colors.accentBright} />
        </View>
      )}
    </ScrollView>
  );
}
