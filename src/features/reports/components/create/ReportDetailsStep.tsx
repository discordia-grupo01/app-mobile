import {
  isReportDetailRequired,
  REPORT_CANCEL_ACTION,
  REPORT_DETAIL_LABEL,
  REPORT_DETAIL_OPTIONAL_HINT,
  REPORT_DETAIL_PLACEHOLDER,
  REPORT_SUBMIT_ACTION,
  type ReportCategory,
  reportAudienceNotice,
  reportDetailMaxLength,
} from "@discordia/client-shared";

import { type ReactNode } from "react";
import { Text, TextInput, View } from "react-native";

import { Button } from "../../../../components/ui/Button";
import { FormErrorBanner } from "../../../../components/ui/FormErrorBanner";
import { cn } from "../../../../lib/cn";
import { useThemeColors } from "../../../../theme/theme-context";

interface ReportDetailsStepProps {
  preview: ReactNode;
  category: ReportCategory;
  serverName: string;
  detail: string;
  detailError?: string;
  errorMessage: string;
  isSubmitting: boolean;
  onDetailChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

/** Paso 2: el detalle (obligatorio solo en "Otro") y el envio. */
export function ReportDetailsStep({
  preview,
  category,
  serverName,
  detail,
  detailError,
  errorMessage,
  isSubmitting,
  onDetailChange,
  onSubmit,
  onCancel,
}: ReportDetailsStepProps) {
  const colors = useThemeColors();
  const length = [...detail.trim()].length;
  const maxLength = reportDetailMaxLength(category);

  return (
    <View className="gap-4">
      {preview}

      <View>
        <View className="mb-1.5 flex-row items-center justify-between gap-2">
          <Text className="shrink text-[11px] font-bold uppercase tracking-[1.2px] text-content-subtle">
            {REPORT_DETAIL_LABEL}
            {isReportDetailRequired(category)
              ? ""
              : ` ${REPORT_DETAIL_OPTIONAL_HINT}`}
          </Text>
          <Text
            className={cn(
              "text-xs",
              length > maxLength ? "text-danger" : "text-content-subtle",
            )}
          >
            {length}/{maxLength}
          </Text>
        </View>
        <TextInput
          value={detail}
          onChangeText={onDetailChange}
          placeholder={REPORT_DETAIL_PLACEHOLDER}
          placeholderTextColor={colors.textSubtle}
          multiline
          autoFocus
          textAlignVertical="top"
          accessibilityLabel={REPORT_DETAIL_LABEL}
          className={cn(
            "min-h-[88px] max-h-40 rounded-xl border bg-surface-input p-3 text-[14px] text-content",
            detailError ? "border-danger" : "border-line",
          )}
        />
        {detailError ? (
          <Text className="mt-1.5 text-xs text-danger">{detailError}</Text>
        ) : null}
      </View>

      <Text className="text-[12px] leading-[17px] text-content-subtle">
        {reportAudienceNotice(serverName)}
      </Text>

      <FormErrorBanner message={errorMessage} />

      <View className="gap-2.5">
        <Button
          title={REPORT_SUBMIT_ACTION}
          variant="danger"
          isLoading={isSubmitting}
          onPress={onSubmit}
        />
        <Button
          title={REPORT_CANCEL_ACTION}
          variant="secondary"
          onPress={onCancel}
        />
      </View>
    </View>
  );
}
