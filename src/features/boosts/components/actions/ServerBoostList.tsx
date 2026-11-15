import {
  activeBoostsLabel,
  BOOST_LIST_COPY,
  type Boost,
  boostRowMeta,
} from "@discordia/client-shared";

import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

import { FormErrorBanner } from "../../../../components/ui/FormErrorBanner";
import { cn } from "../../../../lib/cn";
import { useThemeColors } from "../../../../theme/theme-context";
import { EmptyHistory } from "../../../billing/components/history/EmptyHistory";
import { ListPagination } from "../../../billing/components/history/ListPagination";
import type { ServerBoostsPage } from "../../useServerBoostsPage";
import { BoostActionIcon } from "../BoostActionIcon";
import { BoostStatusChip } from "./BoostStatusChip";

interface ServerBoostListProps {
  list: ServerBoostsPage;
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
      <View
        className={cn(
          "h-9 w-9 items-center justify-center rounded-xl bg-surface-input",
          boost.status !== "active" && "opacity-45",
        )}
      >
        <BoostActionIcon size={20} />
      </View>
      <View className="flex-1 gap-1">
        <BoostStatusChip status={boost.status} />
        <Text className="text-xs text-content-subtle">
          {boostRowMeta(boost)}
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

export function ServerBoostList({ list, onRemove }: ServerBoostListProps) {
  const colors = useThemeColors();
  const active = list.data?.active ?? 0;
  const boosts = list.data?.boosts ?? [];

  return (
    <View>
      <View className="mb-3 flex-row items-baseline justify-between gap-3">
        <Text
          accessibilityRole="header"
          className="flex-1 font-display text-base font-bold text-content"
        >
          {BOOST_LIST_COPY.title}
        </Text>
        {active > 0 ? (
          <Text className="text-xs font-semibold text-content-subtle">
            {activeBoostsLabel(active)}
          </Text>
        ) : null}
      </View>
      {list.loadError ? (
        <View className="mb-3">
          <FormErrorBanner message={list.loadError} />
        </View>
      ) : null}
      {list.data === null ? (
        list.loadError ? null : (
          <View className="items-center py-6">
            <ActivityIndicator size="small" color={colors.accentBright} />
          </View>
        )
      ) : boosts.length === 0 ? (
        <EmptyHistory text={BOOST_LIST_COPY.empty} />
      ) : (
        <>
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
          <ListPagination
            page={list.page}
            pageCount={list.pageCount}
            range={list.range}
            total={list.total}
            noun={BOOST_LIST_COPY.paginationNoun}
            onPageChange={list.setPage}
          />
        </>
      )}
      <Text className="mt-2 text-xs text-content-subtle">
        {BOOST_LIST_COPY.footnote}
      </Text>
    </View>
  );
}
