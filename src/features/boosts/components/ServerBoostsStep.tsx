import {
  type BoostSectionTab,
  BOOSTS_SECTION_DESCRIPTION,
  RETRY_LABEL,
  type ServerSummary,
} from "@discordia/client-shared";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { Button } from "../../../components/ui/Button";
import { FormErrorBanner } from "../../../components/ui/FormErrorBanner";
import { useServerBoostSummary } from "../useServerBoostSummary";
import { BoostPerksTable } from "./BoostPerksTable";
import { BoostShowcase } from "./BoostShowcase";
import { BoostSectionTabs } from "./navigation/BoostSectionTabs";
import { ServerBoostTab } from "./ServerBoostTab";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";

interface ServerBoostsStepProps {
  server: ServerSummary;
  initialTab?: BoostSectionTab;
  onBuyPoints: () => void;
}

export function ServerBoostsStep({
  server,
  initialTab = "boost",
  onBuyPoints,
}: ServerBoostsStepProps) {
  const { summary, loadError, retry } = useServerBoostSummary(server.id);
  const [tab, setTab] = useState<BoostSectionTab>(initialTab);

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-5 px-4.5 pt-5 pb-8"
      keyboardShouldPersistTaps="handled"
    >
      <Text className="text-[14px] leading-5 text-content-muted">
        {BOOSTS_SECTION_DESCRIPTION}
      </Text>

      <BoostSectionTabs active={tab} onSelect={setTab} />

      {summary && tab === "boost" ? (
        <ServerBoostTab
          server={server}
          summary={summary}
          onSummaryStale={retry}
          onBuyPoints={onBuyPoints}
        />
      ) : summary ? (
        <View className="gap-7">
          <BoostPerksTable level={summary.level} />
          <BoostShowcase server={server} level={summary.level} />
        </View>
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
        <LoadingSpinner />
      )}
    </ScrollView>
  );
}
