import { paginationSummary } from "@discordia/client-shared";

import { Text, View } from "react-native";

import { Pagination } from "./Pagination";

interface PaginationFooterProps {
  page: number;
  pageCount: number;
  range: { from: number; to: number };
  total: number;
  /** Lo que se esta contando: "baneados", "miembros", "resultados". */
  noun: string;
  onPageChange: (page: number) => void;
}

/** Resumen "Mostrando 1–20 de 44 baneados" y la barra de paginas debajo. */
export function PaginationFooter({
  page,
  pageCount,
  range,
  total,
  noun,
  onPageChange,
}: PaginationFooterProps) {
  return (
    <View className="shrink-0 items-center gap-3 border-t border-line px-5 py-4">
      <Text
        accessibilityLiveRegion="polite"
        className="text-center text-xs text-content-muted"
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
