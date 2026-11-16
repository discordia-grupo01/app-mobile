import {
  BILLING_COPY,
  formatArsFromCents,
  formatBillingDate,
  formatPoints,
  formatPointsDelta,
  LEDGER_REASON_LABELS,
  type LedgerEntry,
  type PointPurchase,
  PURCHASE_STATUS_DESCRIPTIONS,
  PURCHASE_STATUS_LABELS,
  PURCHASE_STATUS_TONE,
  unrecoveredPointsNote,
} from "@discordia/client-shared";

import { Text, View } from "react-native";

import { withAlpha } from "../../../../lib/color";
import { useThemeColors } from "../../../../theme/theme-context";
import { DiscordiaPointIcon } from "../shared/DiscordiaIcons";
import { HistoryList } from "./HistoryList";
import { billingToneColor } from "../shared/billingTone";

function PurchaseRow({ purchase }: { purchase: PointPurchase }) {
  const colors = useThemeColors();
  const tone = billingToneColor(PURCHASE_STATUS_TONE[purchase.status], colors);

  return (
    <View>
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-surface-input">
          <DiscordiaPointIcon size={21} />
        </View>
        <View className="flex-1">
          <Text className="text-[15px] font-semibold text-content">
            {formatPoints(purchase.points)}
          </Text>
          <Text className="text-[12px] text-content-subtle tabular-nums">
            {formatArsFromCents(purchase.price_cents)} ·{" "}
            {formatBillingDate(purchase.created_at)}
          </Text>
        </View>
        <View
          className="rounded-full px-2 py-0.5"
          style={{ backgroundColor: withAlpha(tone, 0.15) }}
        >
          <Text
            className="text-[10px] font-bold uppercase"
            style={{ color: tone }}
          >
            {PURCHASE_STATUS_LABELS[purchase.status]}
          </Text>
        </View>
      </View>
      <Text className="ml-[52px] mt-1 text-[12px] leading-[17px] text-content-subtle">
        {PURCHASE_STATUS_DESCRIPTIONS[purchase.status]}
      </Text>
      {purchase.points_unrecovered > 0 ? (
        <View
          className="mt-2 rounded-lg px-3 py-2"
          style={{ backgroundColor: withAlpha(colors.danger, 0.1) }}
        >
          <Text className="text-[12px] text-danger">
            {unrecoveredPointsNote(purchase.points_unrecovered)}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function MovementRow({ entry }: { entry: LedgerEntry }) {
  return (
    <View className="flex-row items-center gap-3">
      <DiscordiaPointIcon size={24} />
      <View className="flex-1">
        <Text className="text-[15px] font-semibold text-content">
          {LEDGER_REASON_LABELS[entry.reason]}
        </Text>
        <Text className="text-[12px] text-content-subtle">
          {formatBillingDate(entry.created_at)}
        </Text>
      </View>
      <Text
        className={
          entry.delta >= 0
            ? "text-[15px] font-bold text-success tabular-nums"
            : "text-[15px] font-bold text-danger tabular-nums"
        }
      >
        {formatPointsDelta(entry.delta)}
      </Text>
    </View>
  );
}

interface BillingHistoryProps {
  purchases: PointPurchase[];
  ledger: LedgerEntry[];
}

export function BillingHistory({ purchases, ledger }: BillingHistoryProps) {
  return (
    <View className="gap-6">
      <HistoryList
        title={BILLING_COPY.historyTitle}
        subtitle={BILLING_COPY.historySubtitle}
        emptyText={BILLING_COPY.historyEmpty}
        noun="compras"
        items={purchases}
        keyOf={(purchase) => purchase.id}
        renderItem={(purchase) => <PurchaseRow purchase={purchase} />}
      />
      <HistoryList
        title={BILLING_COPY.movementsTitle}
        subtitle={BILLING_COPY.movementsSubtitle}
        emptyText={BILLING_COPY.movementsEmpty}
        noun="movimientos"
        items={ledger}
        keyOf={(entry, index) => `${entry.created_at}-${index}`}
        renderItem={(entry) => <MovementRow entry={entry} />}
      />
    </View>
  );
}
