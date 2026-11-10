import {
  REPORT_CATEGORY_PROMPT,
  type ReportCategory,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { type ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { cn } from "../../../../lib/cn";
import { useThemeColors } from "../../../../theme/theme-context";

interface ReportCategoryStepProps {
  preview: ReactNode;
  categories: readonly ReportCategory[];
  onChoose: (category: ReportCategory) => void;
}

/** Paso 1: por que se reporta, como las opciones del reporte de Discord. */
export function ReportCategoryStep({
  preview,
  categories,
  onChoose,
}: ReportCategoryStepProps) {
  const colors = useThemeColors();

  return (
    <View className="gap-4">
      <Text className="text-[14px] leading-5 text-content-muted">
        {REPORT_CATEGORY_PROMPT}
      </Text>
      {preview}
      <View className="overflow-hidden rounded-xl border border-line bg-surface-raised">
        {categories.map((category, index) => (
          <TouchableOpacity
            key={category.id}
            activeOpacity={0.7}
            onPress={() => onChoose(category)}
            accessibilityRole="button"
            className={cn(
              "flex-row items-center justify-between gap-3 px-4 py-3.5",
              index > 0 && "border-t border-line",
            )}
          >
            <Text className="flex-1 text-[14px] font-semibold text-content">
              {category.label}
            </Text>
            <Feather name="chevron-right" size={16} color={colors.textSubtle} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
