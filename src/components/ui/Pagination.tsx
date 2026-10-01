import {
  PAGINATION_NEXT,
  PAGINATION_PREVIOUS,
  visiblePages,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import {
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { cn } from "../../lib/cn";
import { useThemeColors } from "../../theme/theme-context";

/** Ancho desde el que los extremos muestran texto en vez de flecha (breakpoint `sm` de web). */
const WIDE_LAYOUT_MIN_WIDTH = 640;

interface PaginationProps {
  /** 1-based. */
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

interface CellProps {
  label: string;
  onPress: () => void;
  isDisabled?: boolean;
  isCurrent?: boolean;
  className?: string;
  children: React.ReactNode;
}

function Cell({
  label,
  onPress,
  isDisabled = false,
  isCurrent = false,
  className,
  children,
}: CellProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, selected: isCurrent }}
      className={cn(
        "h-10 items-center justify-center px-3",
        isCurrent && "bg-surface-hover",
        isDisabled && "opacity-40",
        className,
      )}
    >
      {children}
    </TouchableOpacity>
  );
}

function Divider() {
  return <View className="w-px bg-line-strong" />;
}

/**
 * Barra segmentada `Anterior · 1 2 3 4 5 · Siguiente`, con la misma ventana de
 * cinco numeros que `web-client`. En pantallas angostas los textos de los
 * extremos pasan a ser flechas para que entre en un celular.
 */
export function Pagination({ page, pageCount, onPageChange }: PaginationProps) {
  const colors = useThemeColors();
  const { width } = useWindowDimensions();
  const isWide = width >= WIDE_LAYOUT_MIN_WIDTH;

  const isFirst = page <= 1;
  const isLast = page >= pageCount;

  function renderEdge(
    label: string,
    icon: "chevron-left" | "chevron-right",
    target: number,
    isDisabled: boolean,
  ) {
    return (
      <Cell
        label={label}
        onPress={() => onPageChange(target)}
        isDisabled={isDisabled}
      >
        {isWide ? (
          <Text className="text-sm font-medium text-content-muted">
            {label}
          </Text>
        ) : (
          <Feather name={icon} size={16} color={colors.textMuted} />
        )}
      </Cell>
    );
  }

  return (
    <View
      accessibilityRole="toolbar"
      accessibilityLabel="Paginación"
      className="max-w-full flex-row overflow-hidden rounded-xl border border-line-strong bg-surface-input"
    >
      {renderEdge(PAGINATION_PREVIOUS, "chevron-left", page - 1, isFirst)}

      {visiblePages(page, pageCount).map((number) => {
        const isCurrent = number === page;
        return (
          <View key={number} className="flex-row">
            <Divider />
            <Cell
              label={`Página ${number}`}
              onPress={() => onPageChange(number)}
              isCurrent={isCurrent}
              className={isWide ? "min-w-11" : "min-w-9"}
            >
              <Text
                className={cn(
                  "text-sm tabular-nums",
                  isCurrent
                    ? "font-bold text-accent-strong"
                    : "font-medium text-content-muted",
                )}
              >
                {number}
              </Text>
            </Cell>
          </View>
        );
      })}

      <Divider />
      {renderEdge(PAGINATION_NEXT, "chevron-right", page + 1, isLast)}
    </View>
  );
}
