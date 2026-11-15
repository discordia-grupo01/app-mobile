import {
  BOOST_STATUS_LABELS,
  BOOST_STATUS_TONE,
  type BoostStatus,
} from "@discordia/client-shared";

import { Text, View } from "react-native";

import { withAlpha } from "../../../../lib/color";
import { useThemeColors } from "../../../../theme/theme-context";
import { billingToneColor } from "../../../billing/components/shared/billingTone";

export function BoostStatusChip({ status }: { status: BoostStatus }) {
  const colors = useThemeColors();
  const tone = billingToneColor(BOOST_STATUS_TONE[status], colors);

  return (
    <View
      className="self-start rounded-full px-2.5 py-0.5"
      style={{ backgroundColor: withAlpha(tone, 0.15) }}
    >
      <Text className="text-[11px] font-semibold" style={{ color: tone }}>
        {BOOST_STATUS_LABELS[status]}
      </Text>
    </View>
  );
}
