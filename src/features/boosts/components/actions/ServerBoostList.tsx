import {
  activeBoostsLabel,
  BOOST_LIST_COPY,
  type Boost,
  boostRefundNote,
  formatBillingDate,
} from "@discordia/client-shared";

import { Text, TouchableOpacity, View } from "react-native";

import { cn } from "../../../../lib/cn";
import { EmptyHistory } from "../../../billing/components/history/EmptyHistory";
import { BoostActionIcon } from "../BoostActionIcon";
import { BoostStatusChip } from "./BoostStatusChip";

interface ServerBoostListProps {
  boosts: Boost[];
  activeCount: number;
  onRemove: (boost: Boost) => void;
}

function BoostRow({
  boost,
  onRemove,
}: {
  boost: Boost;
  onRemove: (boost: Boost) => void;
}) {
  return (
    <View className="flex-row items-center gap-3 bg-surface-raised px-4 py-3">
      <View className="h-9 w-9 items-center justify-center rounded-xl bg-surface-input">
        <BoostActionIcon size={20} />
      </View>
      <View className="flex-1 gap-1">
        <BoostStatusChip status={boost.status} />
        <Text className="text-xs text-content-subtle">
          {formatBillingDate(boost.created_at)}
          {boost.status === "failed" ? ` · ${boostRefundNote(boost)}` : ""}
        </Text>
      </View>
      {boost.status === "active" ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onRemove(boost)}
          accessibilityRole="button"
          className="rounded-xl bg-danger-soft px-4 py-2"
        >
          <Text className="text-xs font-semibold text-danger">
            {BOOST_LIST_COPY.remove}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function ServerBoostList({
  boosts,
  activeCount,
  onRemove,
}: ServerBoostListProps) {
  return (
    <View>
      <View className="mb-3 flex-row items-baseline justify-between gap-3">
        <Text
          accessibilityRole="header"
          className="flex-1 font-display text-base font-bold text-content"
        >
          {BOOST_LIST_COPY.title}
        </Text>
        {activeCount > 0 ? (
          <Text className="text-xs font-semibold text-content-subtle">
            {activeBoostsLabel(activeCount)}
          </Text>
        ) : null}
      </View>
      {boosts.length === 0 ? (
        <EmptyHistory text={BOOST_LIST_COPY.empty} />
      ) : (
        <View className="overflow-hidden rounded-2xl border border-line">
          {boosts.map((boost, index) => (
            <View
              key={boost.id}
              className={cn(index > 0 && "border-t border-line")}
            >
              <BoostRow boost={boost} onRemove={onRemove} />
            </View>
          ))}
        </View>
      )}
      <Text className="mt-2 text-xs text-content-subtle">
        {BOOST_LIST_COPY.footnote}
      </Text>
    </View>
  );
}
