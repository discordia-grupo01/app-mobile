import { paginationSummary } from "@discordia/client-shared";

import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { Pagination } from "../../../../components/ui/Pagination";
import { usePagination } from "../../../../hooks/usePagination";
import { BILLING_HISTORY_PAGE_SIZE } from "../../billingSections";
import { DiscordiaPointIcon } from "../shared/DiscordiaIcons";

interface HistoryListProps<T> {
  title: string;
  subtitle: string;
  emptyText: string;
  noun: string;
  items: readonly T[];
  keyOf: (item: T, index: number) => string;
  renderItem: (item: T) => ReactNode;
}

/** Bloque del historial: título, lista en tarjeta, vacío punteado y paginado de a 10. */
export function HistoryList<T>({
  title,
  subtitle,
  emptyText,
  noun,
  items,
  keyOf,
  renderItem,
}: HistoryListProps<T>) {
  const paged = usePagination(items, BILLING_HISTORY_PAGE_SIZE);

  return (
    <View>
      <View className="mb-3">
        <Text className="text-[16px] font-bold text-content">{title}</Text>
        <Text className="mt-1 text-[13px] text-content-subtle">{subtitle}</Text>
      </View>

      {items.length === 0 ? (
        <View className="items-center rounded-2xl border border-dashed border-line-strong bg-surface-raised px-5 py-8">
          <DiscordiaPointIcon size={27} />
          <Text className="mt-3 text-center text-[14px] font-semibold text-content-muted">
            {emptyText}
          </Text>
        </View>
      ) : (
        <View className="overflow-hidden rounded-2xl border border-line">
          {paged.pageItems.map((item, index) => (
            <View
              key={keyOf(item, index)}
              className={
                index === 0
                  ? "bg-surface-raised px-4 py-3"
                  : "border-t border-line bg-surface-raised px-4 py-3"
              }
            >
              {renderItem(item)}
            </View>
          ))}
        </View>
      )}

      {paged.pageCount > 1 ? (
        <View className="mt-3 items-center gap-2">
          <Text
            accessibilityLiveRegion="polite"
            className="text-[12px] text-content-muted"
          >
            {paginationSummary(
              paged.range.from,
              paged.range.to,
              paged.total,
              noun,
            )}
          </Text>
          <Pagination
            page={paged.page}
            pageCount={paged.pageCount}
            onPageChange={paged.setPage}
          />
        </View>
      ) : null}
    </View>
  );
}
