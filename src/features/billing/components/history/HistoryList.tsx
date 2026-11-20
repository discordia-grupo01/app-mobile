import { DEFAULT_PAGE_SIZE } from "@discordia/client-shared";

import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { usePagination } from "../../../../hooks/usePagination";
import { EmptyHistory } from "./EmptyHistory";
import { ListPagination } from "./ListPagination";

interface HistoryListProps<T> {
  title: string;
  subtitle: string;
  emptyText: string;
  noun: string;
  items: readonly T[];
  keyOf: (item: T, index: number) => string;
  renderItem: (item: T) => ReactNode;
  headerAccessory?: ReactNode;
}

export function HistoryList<T>({
  title,
  subtitle,
  emptyText,
  noun,
  items,
  keyOf,
  renderItem,
  headerAccessory,
}: HistoryListProps<T>) {
  const paged = usePagination(items, DEFAULT_PAGE_SIZE);

  return (
    <View>
      <View className="mb-3">
        <Text className="text-[16px] font-bold text-content">{title}</Text>
        <Text className="mt-1 text-[13px] text-content-subtle">{subtitle}</Text>
        {headerAccessory ? (
          <View className="mt-3">{headerAccessory}</View>
        ) : null}
      </View>

      {items.length === 0 ? (
        <EmptyHistory text={emptyText} />
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

      <ListPagination
        page={paged.page}
        pageCount={paged.pageCount}
        range={paged.range}
        total={paged.total}
        noun={noun}
        onPageChange={paged.setPage}
      />
    </View>
  );
}
