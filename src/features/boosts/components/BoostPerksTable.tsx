import {
  BOOST_LEVELS,
  BOOST_TABLE_INCLUDED,
  BOOST_TABLE_NOT_INCLUDED,
  BOOST_TABLE_NOTE,
  BOOST_TABLE_PERK_HEADER,
  BOOST_TABLE_ROW_LABELS,
  BOOST_TABLE_ROWS,
  BOOST_TABLE_TITLE,
  type BoostLevel,
  boostLevelColumnDetail,
  boostLevelLabel,
  boostLevelShortLabel,
  type BoostTableCell,
} from "@discordia/client-shared";
import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { cn } from "../../../lib/cn";
import { useThemeColors } from "../../../theme/theme-context";
import { BoostLevelIcon } from "./BoostLevelIcon";

const PERK_COLUMN = "w-[30%] px-3";

interface BoostPerksTableProps {
  level: BoostLevel;
}

export function BoostPerksTable({ level }: BoostPerksTableProps) {
  return (
    <View className="gap-2.5">
      <Text
        accessibilityRole="header"
        className="font-display text-base font-bold text-content"
      >
        {BOOST_TABLE_TITLE}
      </Text>

      <View className="overflow-hidden rounded-2xl border border-line-strong">
        <View className="flex-row bg-surface-sunken">
          <View className={cn(PERK_COLUMN, "justify-center py-3")}>
            <Text className="text-[10px] font-bold uppercase tracking-wider text-content-subtle">
              {BOOST_TABLE_PERK_HEADER}
            </Text>
          </View>
          {BOOST_LEVELS.map((column) => {
            const isCurrent = column === level;
            return (
              <View
                key={column}
                accessible
                accessibilityLabel={`${boostLevelLabel(column)}, ${boostLevelColumnDetail(column, isCurrent)}`}
                className={cn(
                  "flex-1 items-center gap-1.5 px-1 pb-2.5 pt-3",
                  isCurrent && "bg-boost-column",
                )}
              >
                {isCurrent ? (
                  <View className="absolute left-0 right-0 top-0 h-[3px] bg-boost-yellow" />
                ) : null}
                <BoostLevelIcon level={column} size={24} bare />
                <Text
                  className={cn(
                    "font-display text-[12px] font-bold",
                    isCurrent ? "text-content" : "text-content-muted",
                  )}
                >
                  {boostLevelShortLabel(column)}
                </Text>
              </View>
            );
          })}
        </View>

        {BOOST_TABLE_ROWS.map((row) => (
          <View
            key={row.perk}
            className="flex-row border-t border-line bg-surface-raised"
          >
            <View className={cn(PERK_COLUMN, "justify-center py-3")}>
              <Text className="text-xs font-medium text-content-muted">
                {BOOST_TABLE_ROW_LABELS[row.perk].shortLabel}
              </Text>
            </View>
            {row.cells.map((cell, index) => {
              const column = BOOST_LEVELS[index] ?? 0;
              return (
                <View
                  key={column}
                  className={cn(
                    "flex-1 items-center justify-center px-1 py-3",
                    column === level && "bg-boost-column",
                  )}
                >
                  <TableCell cell={cell} unlocked={column <= level} />
                </View>
              );
            })}
          </View>
        ))}
      </View>

      <Text className="text-[11px] leading-4 text-content-muted">
        {BOOST_TABLE_NOTE}
      </Text>
    </View>
  );
}

function TableCell({
  cell,
  unlocked,
}: {
  cell: BoostTableCell;
  unlocked: boolean;
}) {
  const colors = useThemeColors();
  if (cell.kind === "amount") {
    return (
      <Text
        className={cn(
          "text-xs",
          unlocked
            ? "font-bold text-content"
            : "font-semibold text-content-muted",
        )}
      >
        {cell.value}
      </Text>
    );
  }
  if (!cell.included) {
    return (
      <Text
        accessibilityLabel={BOOST_TABLE_NOT_INCLUDED}
        className="text-xs text-content-subtle"
      >
        —
      </Text>
    );
  }
  return (
    <View
      accessible
      accessibilityLabel={BOOST_TABLE_INCLUDED}
      className={cn(
        "h-5.5 w-5.5 items-center justify-center rounded-full",
        unlocked ? "bg-info" : "bg-surface-input",
      )}
    >
      <Feather
        name="check"
        size={12}
        color={unlocked ? colors.boostPaper : colors.textSubtle}
      />
    </View>
  );
}
