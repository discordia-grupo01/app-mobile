import {
  BAN_CONFIRM_LABEL,
  BAN_MEMBER_CONSEQUENCES,
  BAN_MEMBER_SUBTITLE,
  BAN_MEMBER_TITLE,
  BAN_REASON_LABEL,
  BAN_REASON_MAX_LENGTH,
  BAN_REASON_PLACEHOLDER,
  banSuccessNotice,
  validateBanReason,
} from "@discordia/client-shared";

import { useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";

import { Button } from "../../../components/ui/Button";
import { FormErrorBanner } from "../../../components/ui/FormErrorBanner";
import { ModalShell } from "../../../components/ui/ModalShell";
import { SuccessNotice } from "../../../components/ui/SuccessNotice";
import { useThemeColors } from "../../../theme/theme-context";
import { ServerAvatar } from "../../servers/components/ServerAvatar";
import { banMember } from "../api";
import { type BanTarget } from "../types";
import { BanModalHeader } from "./BanModalHeader";
import { ModalCloseButton } from "../../../components/ui/ModalCloseButton";

interface BanMemberModalProps {
  serverId: string;
  target: BanTarget;
  onClose: () => void;
  /** Se dispara apenas el back confirma el baneo (el modal sigue abierto). */
  onBanned: () => void;
}

/**
 * Confirmacion de baneo con motivo opcional. Los rechazos por jerarquia o
 * falta de permiso los decide el back y se muestran tal cual llegan.
 * Se monta solo mientras hay a quien banear, asi el estado se reinicia solo.
 */
export function BanMemberModal({
  serverId,
  target,
  onClose,
  onBanned,
}: BanMemberModalProps) {
  const colors = useThemeColors();
  const [reason, setReason] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBanned, setIsBanned] = useState(false);

  const reasonError = validateBanReason(reason);
  const reasonLength = [...reason].length;

  async function handleSubmit() {
    if (reasonError) return;
    setIsSubmitting(true);
    setErrorMessage("");
    const result = await banMember(serverId, { userId: target.userId, reason });
    setIsSubmitting(false);
    if (!result.ok) {
      setErrorMessage(result.fieldErrors?.reason ?? result.message);
      return;
    }
    setIsBanned(true);
    onBanned();
  }

  return (
    <ModalShell visible onClose={onClose} className="max-w-[480px]">
      <ModalCloseButton variant="subtle" onPress={onClose} />
      <BanModalHeader title={BAN_MEMBER_TITLE} subtitle={BAN_MEMBER_SUBTITLE} />

      {isBanned ? (
        <View className="gap-5 px-5 py-6">
          <SuccessNotice message={banSuccessNotice(target.name)} />
          <Button title="Cerrar" variant="secondary" onPress={onClose} />
        </View>
      ) : (
        <ScrollView
          contentContainerClassName="gap-4 px-5 py-5"
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-row items-center gap-3 rounded-xl bg-surface-raised p-3">
            <ServerAvatar name={target.name} uri={target.avatarUri} size={40} />
            <Text
              numberOfLines={1}
              className="min-w-0 flex-1 text-[15px] font-semibold text-content"
            >
              {target.name}
            </Text>
          </View>

          <View>
            <View className="mb-1.5 flex-row items-center justify-between gap-2">
              <Text className="shrink text-[11px] font-bold uppercase tracking-[1.2px] text-content-subtle">
                {BAN_REASON_LABEL} (opcional)
              </Text>
              <Text
                className={
                  reasonError
                    ? "text-xs text-danger"
                    : "text-xs text-content-subtle"
                }
              >
                {reasonLength}/{BAN_REASON_MAX_LENGTH}
              </Text>
            </View>
            <TextInput
              value={reason}
              onChangeText={(value) => {
                setReason(value);
                setErrorMessage("");
              }}
              placeholder={BAN_REASON_PLACEHOLDER}
              placeholderTextColor={colors.textSubtle}
              multiline
              textAlignVertical="top"
              accessibilityLabel={BAN_REASON_LABEL}
              className="min-h-[88px] max-h-40 rounded-xl border border-line bg-surface-input p-3 text-[14px] text-content"
            />
            {reasonError ? (
              <Text className="mt-1.5 text-xs text-danger">{reasonError}</Text>
            ) : null}
          </View>

          <FormErrorBanner message={errorMessage} />

          <Text className="text-[13px] leading-5 text-content-muted">
            {BAN_MEMBER_CONSEQUENCES}
          </Text>

          <View className="gap-2.5">
            <Button
              title={BAN_CONFIRM_LABEL}
              variant="danger"
              onPress={handleSubmit}
              isLoading={isSubmitting}
              disabled={Boolean(reasonError)}
            />
            <Button title="Cancelar" variant="secondary" onPress={onClose} />
          </View>
        </ScrollView>
      )}
    </ModalShell>
  );
}
