import { paginationSummary } from "@discordia/client-shared";

import { Text, View } from "react-native";

import { Pagination } from "../../../../components/ui/Pagination";

interface ListPaginationProps {
  page: number;
  pageCount: number;
  range: { from: number; to: number };
  total: number;
  noun: string;
  onPageChange: (page: number) => void;
}

/** "Mostrando 1–10 de 13 boosts" y la barra, debajo de una lista de tarjetas. */
export function ListPagination({
  page,
  pageCount,
  range,
  total,
  noun,
  onPageChange,
}: ListPaginationProps) {
  if (pageCount <= 1) return null;

  return (
    <View className="mt-3 items-center gap-2">
      <Text
        accessibilityLiveRegion="polite"
        className="text-[12px] text-content-muted"
      >
        {paginationSummary(range.from, range.to, total, noun)}
      </Text>
      <Pagination
        page={page}
        pageCount={pageCount}
        onPageChange={onPageChange}
      />
    </View>
  );
}
