import {
  BAN_REASON_MAX_LENGTH,
  MUTE_CONFIRM_LABEL,
  MUTE_DURATION_LABEL,
  MUTE_DURATIONS,
  MUTE_MEMBER_CONSEQUENCES,
  MUTE_MEMBER_SUBTITLE,
  MUTE_MEMBER_TITLE,
  MUTE_REASON_LABEL,
  MUTE_REASON_PLACEHOLDER,
  muteSuccessNotice,
  muteUntilFrom,
  validateBanReason,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Avatar } from "../../../components/ui/Avatar";
import { Button } from "../../../components/ui/Button";
import { FormErrorBanner } from "../../../components/ui/FormErrorBanner";
import { ModalCloseButton } from "../../../components/ui/ModalCloseButton";
import { ModalShell } from "../../../components/ui/ModalShell";
import { SuccessNotice } from "../../../components/ui/SuccessNotice";
import { cn } from "../../../lib/cn";
import { useThemeColors } from "../../../theme/theme-context";
import { BanModalHeader } from "../../bans/components/BanModalHeader";
import { type BanTarget } from "../../bans/types";
import { muteMember } from "../api";

const DEFAULT_DURATION_ID = "1h";
const DURATION_COLUMNS = 3;

interface MuteMemberModalProps {
  serverId: string;
  target: BanTarget;
  onClose: () => void;
  /** Se dispara apenas el back confirma el silencio (el modal sigue abierto). */
  onMuted: (untilAt: string) => void;
}

/**
 * Silenciar por un tiempo (#60 CA1): se elige la duracion y, opcional, el
 * motivo. Al vencer, el back lo levanta solo (CA2).
 */
export function MuteMemberModal({
  serverId,
  target,
  onClose,
  onMuted,
}: MuteMemberModalProps) {
  const colors = useThemeColors();
  const [durationId, setDurationId] = useState(DEFAULT_DURATION_ID);
  const [reason, setReason] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mutedUntil, setMutedUntil] = useState<string | null>(null);

  const reasonError = validateBanReason(reason);
  const rows: (typeof MUTE_DURATIONS)[number][][] = [];
  for (let i = 0; i < MUTE_DURATIONS.length; i += DURATION_COLUMNS) {
    rows.push(MUTE_DURATIONS.slice(i, i + DURATION_COLUMNS));
  }

  async function handleSubmit() {
    const duration = MUTE_DURATIONS.find((d) => d.id === durationId);
    if (!duration || reasonError) return;
    const untilAt = muteUntilFrom(duration);
    setIsSubmitting(true);
    setErrorMessage("");
    const result = await muteMember(serverId, {
      userId: target.userId,
      untilAt,
      reason,
    });
    setIsSubmitting(false);
    if (!result.ok) {
      setErrorMessage(result.message);
      return;
    }
    setMutedUntil(untilAt);
    onMuted(untilAt);
  }

  return (
    <ModalShell visible onClose={onClose} className="max-w-[480px]">
      <ModalCloseButton variant="subtle" onPress={onClose} />
      <BanModalHeader
        title={MUTE_MEMBER_TITLE}
        subtitle={MUTE_MEMBER_SUBTITLE}
        icon={<Feather name="mic-off" size={19} color={colors.danger} />}
      />

      {mutedUntil ? (
        <View className="gap-5 px-5 py-6">
          <SuccessNotice message={muteSuccessNotice(target.name, mutedUntil)} />
          <Button title="Cerrar" variant="secondary" onPress={onClose} />
        </View>
      ) : (
        <ScrollView
          contentContainerClassName="gap-4 px-5 py-5"
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-row items-center gap-3 rounded-xl bg-surface-raised p-3">
            <Avatar name={target.name} uri={target.avatarUri} size={40} />
            <Text
              numberOfLines={1}
              className="min-w-0 flex-1 text-[15px] font-semibold text-content"
            >
              {target.name}
            </Text>
          </View>

          <View>
            <Text className="mb-1.5 text-[11px] font-bold uppercase tracking-[1.2px] text-content-subtle">
              {MUTE_DURATION_LABEL}
            </Text>
            <View className="gap-2" accessibilityRole="radiogroup">
              {rows.map((row) => (
                <View key={row[0].id} className="flex-row gap-2">
                  {row.map((duration) => {
                    const isSelected = duration.id === durationId;
                    return (
                      <TouchableOpacity
                        key={duration.id}
                        activeOpacity={0.7}
                        onPress={() => setDurationId(duration.id)}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: isSelected }}
                        accessibilityLabel={duration.label}
                        className={cn(
                          "flex-1 min-h-11 items-center justify-center rounded-xl border px-2",
                          isSelected
                            ? "border-accent bg-accent/15"
                            : "border-line bg-surface-input",
                        )}
                      >
                        <Text
                          numberOfLines={1}
                          className={cn(
                            "text-[13px]",
                            isSelected
                              ? "font-bold text-content"
                              : "text-content-muted",
                          )}
                        >
                          {duration.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>

          <View>
            <View className="mb-1.5 flex-row items-center justify-between gap-2">
              <Text className="shrink text-[11px] font-bold uppercase tracking-[1.2px] text-content-subtle">
                {MUTE_REASON_LABEL} (opcional)
              </Text>
              <Text
                className={
                  reasonError
                    ? "text-xs text-danger"
                    : "text-xs text-content-subtle"
                }
              >
                {[...reason].length}/{BAN_REASON_MAX_LENGTH}
              </Text>
            </View>
            <TextInput
              value={reason}
              onChangeText={(value) => {
                setReason(value);
                setErrorMessage("");
              }}
              placeholder={MUTE_REASON_PLACEHOLDER}
              placeholderTextColor={colors.textSubtle}
              multiline
              textAlignVertical="top"
              accessibilityLabel={MUTE_REASON_LABEL}
              className="min-h-[72px] max-h-32 rounded-xl border border-line bg-surface-input p-3 text-[14px] text-content"
            />
            {reasonError ? (
              <Text className="mt-1.5 text-xs text-danger">{reasonError}</Text>
            ) : null}
          </View>

          <FormErrorBanner message={errorMessage} />

          <Text className="text-[13px] leading-5 text-content-muted">
            {MUTE_MEMBER_CONSEQUENCES}
          </Text>

          <View className="gap-2.5">
            <Button
              title={MUTE_CONFIRM_LABEL}
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
