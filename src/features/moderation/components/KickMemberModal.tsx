import {
  KICK_CONFIRM_LABEL,
  KICK_MEMBER_CONSEQUENCES,
  KICK_MEMBER_SUBTITLE,
  KICK_MEMBER_TITLE,
  kickSuccessNotice,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { Avatar } from "../../../components/ui/Avatar";
import { Button } from "../../../components/ui/Button";
import { FormErrorBanner } from "../../../components/ui/FormErrorBanner";
import { ModalCloseButton } from "../../../components/ui/ModalCloseButton";
import { ModalShell } from "../../../components/ui/ModalShell";
import { SuccessNotice } from "../../../components/ui/SuccessNotice";
import { useThemeColors } from "../../../theme/theme-context";
import { BanModalHeader } from "../../bans/components/BanModalHeader";
import { type BanTarget } from "../../bans/types";
import { kickMember } from "../api";

interface KickMemberModalProps {
  serverId: string;
  target: BanTarget;
  onClose: () => void;
  /** Se dispara apenas el back confirma la expulsion (el modal sigue abierto). */
  onKicked: () => void;
}

/**
 * Confirmacion de expulsion (#59). Jerarquia (CA2) y permiso (CA3) los decide
 * el back y el motivo se muestra tal cual llega.
 */
export function KickMemberModal({
  serverId,
  target,
  onClose,
  onKicked,
}: KickMemberModalProps) {
  const colors = useThemeColors();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isKicked, setIsKicked] = useState(false);

  async function handleConfirm() {
    setIsSubmitting(true);
    setErrorMessage("");
    const result = await kickMember(serverId, target.userId);
    setIsSubmitting(false);
    if (!result.ok) {
      setErrorMessage(result.message);
      return;
    }
    setIsKicked(true);
    onKicked();
  }

  return (
    <ModalShell visible onClose={onClose} className="max-w-[480px]">
      <ModalCloseButton variant="subtle" onPress={onClose} />
      <BanModalHeader
        title={KICK_MEMBER_TITLE}
        subtitle={KICK_MEMBER_SUBTITLE}
        icon={<Feather name="user-x" size={19} color={colors.danger} />}
      />

      {isKicked ? (
        <View className="gap-5 px-5 py-6">
          <SuccessNotice message={kickSuccessNotice(target.name)} />
          <Button title="Cerrar" variant="secondary" onPress={onClose} />
        </View>
      ) : (
        <ScrollView contentContainerClassName="gap-4 px-5 py-5">
          <View className="flex-row items-center gap-3 rounded-xl bg-surface-raised p-3">
            <Avatar name={target.name} uri={target.avatarUri} size={40} />
            <Text
              numberOfLines={1}
              className="min-w-0 flex-1 text-[15px] font-semibold text-content"
            >
              {target.name}
            </Text>
          </View>

          <FormErrorBanner message={errorMessage} />

          <Text className="text-[13px] leading-5 text-content-muted">
            {KICK_MEMBER_CONSEQUENCES}
          </Text>

          <View className="gap-2.5">
            <Button
              title={KICK_CONFIRM_LABEL}
              variant="danger"
              onPress={handleConfirm}
              isLoading={isSubmitting}
            />
            <Button title="Cancelar" variant="secondary" onPress={onClose} />
          </View>
        </ScrollView>
      )}
    </ModalShell>
  );
}
