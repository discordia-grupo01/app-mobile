import { paginationSummary } from "@discordia/client-shared";

import { Text, View } from "react-native";

import { cn } from "../../lib/cn";

import { Pagination } from "./Pagination";

interface PaginationFooterProps {
  page: number;
  pageCount: number;
  range: { from: number; to: number };
  total: number;
  /** Lo que se esta contando: "baneados", "miembros", "resultados". */
  noun: string;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Resumen "Mostrando 1–20 de 44 baneados" y la barra de paginas debajo. Va al
 * final de la lista, adentro del scroll: fijo abajo ocupaba media pantalla.
 */
export function PaginationFooter({
  page,
  pageCount,
  range,
  total,
  noun,
  onPageChange,
  className,
}: PaginationFooterProps) {
  return (
    <View className={cn("items-center gap-3", className)}>
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
