import {
  type MessageAuthor,
  PRIVATE_CALL_BLOCKED_HINT,
  PRIVATE_CALL_START,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

import { cn } from "../../../lib/cn";
import { useThemeColors } from "../../../theme/theme-context";
import { useOptionalPrivateCall } from "../private-call-context";

interface DmCallButtonProps {
  partner: MessageAuthor;
  conversationId: string | null;
  blockedByMe: boolean;
}

export function DmCallButton({
  partner,
  conversationId,
  blockedByMe,
}: DmCallButtonProps) {
  const colors = useThemeColors();
  const privateCall = useOptionalPrivateCall();
  if (!privateCall) return null;

  const isBusy = privateCall.state.phase !== "idle";
  const isDisabled = blockedByMe || !conversationId || isBusy;
  const label = blockedByMe ? PRIVATE_CALL_BLOCKED_HINT : PRIVATE_CALL_START;

  return (
    <TouchableOpacity
      onPress={() => {
        if (!conversationId) return;
        privateCall.start(
          { id: partner.id, name: partner.name, avatarUrl: partner.avatarUrl },
          conversationId,
        );
      }}
      disabled={isDisabled}
      hitSlop={6}
      className={cn(
        "h-8.5 w-8.5 items-center justify-center",
        isDisabled && "opacity-40",
      )}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled }}
    >
      <Feather name="phone" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );
}
