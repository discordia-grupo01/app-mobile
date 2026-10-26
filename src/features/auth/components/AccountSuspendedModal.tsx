import { Feather } from "@expo/vector-icons";
import {
  ACCOUNT_SUSPENDED_ACTION,
  ACCOUNT_SUSPENDED_DESCRIPTION,
  ACCOUNT_SUSPENDED_TITLE,
} from "@discordia/client-shared";
import { useState } from "react";
import { Text, View } from "react-native";

import { Button } from "../../../components/ui/Button";
import { ModalShell } from "../../../components/ui/ModalShell";
import { useThemeColors } from "../../../theme/theme-context";
import { useAuth } from "../auth-context";

export function AccountSuspendedModal() {
  const { isAccountSuspended, acknowledgeSuspension } = useAuth();
  const colors = useThemeColors();
  const [isLeaving, setIsLeaving] = useState(false);

  async function handleLeave() {
    setIsLeaving(true);
    try {
      await acknowledgeSuspension();
    } finally {
      setIsLeaving(false);
    }
  }

  return (
    <ModalShell
      visible={isAccountSuspended}
      onClose={() => {}}
      dismissOnBackdrop={false}
      className="max-w-80 p-7 pt-8 items-center"
    >
      <View className="w-16 h-16 rounded-[18px] items-center justify-center bg-[rgba(224,82,82,0.14)] mb-5">
        <Feather name="slash" size={26} color={colors.danger} />
      </View>
      <Text className="text-[19px] font-bold text-content text-center">
        {ACCOUNT_SUSPENDED_TITLE}
      </Text>
      <Text className="text-[14px] leading-5 text-content-muted text-center mt-2.5 mb-6.5">
        {ACCOUNT_SUSPENDED_DESCRIPTION}
      </Text>

      <View className="w-full">
        <Button
          title={ACCOUNT_SUSPENDED_ACTION}
          variant="danger"
          isLoading={isLeaving}
          disabled={isLeaving}
          onPress={handleLeave}
        />
      </View>
    </ModalShell>
  );
}
