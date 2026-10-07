import {
  BLOCK_USER_BODY,
  BLOCK_USER_CANCEL_ACTION,
  BLOCK_USER_CONFIRM_ACTION,
  blockUserTitle,
  type BlockUserResult,
  UNBLOCK_USER_BODY,
  UNBLOCK_USER_CONFIRM_ACTION,
  unblockUserTitle,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Text, View } from "react-native";

import { Button } from "../../../components/ui/Button";
import { ModalCloseButton } from "../../../components/ui/ModalCloseButton";
import { ModalShell } from "../../../components/ui/ModalShell";
import { useThemeColors } from "../../../theme/theme-context";

interface BlockUserModalProps {
  visible: boolean;
  userName: string;
  isBlocked: boolean;
  onConfirm: () => Promise<BlockUserResult>;
  onClose: () => void;
}

export function BlockUserModal({
  visible,
  userName,
  isBlocked,
  onConfirm,
  onClose,
}: BlockUserModalProps) {
  const colors = useThemeColors();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [wasVisible, setWasVisible] = useState(visible);

  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setError("");
      setIsSubmitting(false);
    }
  }

  async function handleConfirm() {
    setError("");
    setIsSubmitting(true);
    const result = await onConfirm();
    setIsSubmitting(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    onClose();
  }

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      className="max-w-80 p-7 pt-6 items-center"
    >
      <ModalCloseButton variant="subtle" onPress={onClose} />

      <View
        className={
          isBlocked
            ? "w-16 h-16 rounded-[18px] items-center justify-center bg-accent/15 mt-2 mb-5"
            : "w-16 h-16 rounded-[18px] items-center justify-center bg-[rgba(224,82,82,0.14)] mt-2 mb-5"
        }
      >
        <Feather
          name={isBlocked ? "shield" : "slash"}
          size={26}
          color={isBlocked ? colors.accent : colors.danger}
        />
      </View>
      <Text className="text-[19px] font-bold text-content text-center">
        {isBlocked ? unblockUserTitle(userName) : blockUserTitle(userName)}
      </Text>
      <Text className="text-[14px] leading-5 text-content-muted text-center mt-2.5 mb-2">
        {isBlocked ? UNBLOCK_USER_BODY : BLOCK_USER_BODY}
      </Text>

      {error ? (
        <View className="flex-row items-start gap-2 w-full rounded-xl border border-[rgba(224,82,82,0.3)] bg-[rgba(224,82,82,0.1)] px-3 py-2.5 mt-2.5">
          <Feather name="alert-circle" size={15} color={colors.danger} />
          <Text className="flex-1 text-danger text-[12px] leading-[17px]">
            {error}
          </Text>
        </View>
      ) : null}

      <View className="flex-col gap-2.5 w-full mt-5">
        <Button
          title={BLOCK_USER_CANCEL_ACTION}
          variant="secondary"
          onPress={onClose}
        />
        <Button
          title={
            isBlocked ? UNBLOCK_USER_CONFIRM_ACTION : BLOCK_USER_CONFIRM_ACTION
          }
          variant={isBlocked ? "primary" : "danger"}
          onPress={handleConfirm}
          isLoading={isSubmitting}
        />
      </View>
    </ModalShell>
  );
}
