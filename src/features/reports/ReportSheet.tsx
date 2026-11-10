import {
  REPORT_BACK_LABEL,
  REPORT_MESSAGE_LABEL,
  REPORT_SENT_NOTICE,
  REPORT_USER_LABEL,
  reportCategoriesFor,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { Button } from "../../components/ui/Button";
import { ModalCloseButton } from "../../components/ui/ModalCloseButton";
import { ModalShell } from "../../components/ui/ModalShell";
import { SuccessNotice } from "../../components/ui/SuccessNotice";
import { useThemeColors } from "../../theme/theme-context";
import type { ReportTarget } from "./reportTarget";
import { useReportForm } from "./components/create/useReportForm";
import { ReportCategoryStep } from "./components/create/ReportCategoryStep";
import { ReportDetailsStep } from "./components/create/ReportDetailsStep";
import { ReportTargetPreview } from "./components/shared/ReportTargetPreview";

interface ReportSheetProps {
  serverId: string;
  serverName: string;
  target: ReportTarget;
  onClose: () => void;
}

/**
 * Reportar un mensaje o un usuario (#62): categoria, detalle y enviar. Se
 * monta solo mientras hay algo que reportar, asi el formulario arranca limpio.
 */
export function ReportSheet({
  serverId,
  serverName,
  target,
  onClose,
}: ReportSheetProps) {
  const colors = useThemeColors();
  const form = useReportForm(serverId, target);
  const category = form.step === "details" ? form.category : null;
  const title = category
    ? category.label
    : target.kind === "message"
      ? REPORT_MESSAGE_LABEL
      : REPORT_USER_LABEL;

  const preview =
    target.kind === "message" ? (
      <ReportTargetPreview
        kind="message"
        message={target.message}
        author={target.author}
      />
    ) : (
      <ReportTargetPreview
        kind="user"
        name={target.name}
        avatarUri={target.avatarUri}
      />
    );

  return (
    <ModalShell
      visible
      onClose={onClose}
      dismissOnBackdrop={!form.isSubmitting}
      className="max-w-110"
    >
      <ModalCloseButton onPress={onClose} />
      <View className="flex-row items-center gap-1.5 px-5 pt-5 pr-16 pb-3">
        {category ? (
          <TouchableOpacity
            onPress={form.backToCategories}
            className="-ml-1.5 h-8 w-8 items-center justify-center rounded-lg"
            accessibilityRole="button"
            accessibilityLabel={REPORT_BACK_LABEL}
          >
            <Feather name="chevron-left" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
        <Text
          className="flex-1 text-[19px] font-bold text-content"
          numberOfLines={1}
          accessibilityRole="header"
        >
          {title}
        </Text>
      </View>

      <ScrollView
        contentContainerClassName="px-5 pb-6"
        keyboardShouldPersistTaps="handled"
      >
        {form.step === "sent" ? (
          <View className="gap-4">
            <SuccessNotice message={REPORT_SENT_NOTICE} />
            <Button title="Cerrar" variant="secondary" onPress={onClose} />
          </View>
        ) : category ? (
          <ReportDetailsStep
            preview={preview}
            category={category}
            serverName={serverName}
            detail={form.detail}
            detailError={form.detailError}
            errorMessage={form.errorMessage}
            isSubmitting={form.isSubmitting}
            onDetailChange={form.setDetail}
            onSubmit={() => void form.submit()}
            onCancel={onClose}
          />
        ) : (
          <ReportCategoryStep
            preview={preview}
            categories={reportCategoriesFor(target.kind)}
            onChoose={form.chooseCategory}
          />
        )}
      </ScrollView>
    </ModalShell>
  );
}
