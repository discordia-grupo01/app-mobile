import {
  type Channel,
  type Message,
  MESSAGE_SEARCH_LABEL,
  type MessageAuthor,
  type Role,
} from "@discordia/client-shared";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { TouchableOpacity } from "react-native";

import { useThemeColors } from "../../../theme/theme-context";
import { useMessageSearchForm } from "../useMessageSearchForm";
import { MessageSearchModal } from "./MessageSearchModal";

interface MessageSearchButtonProps {
  serverId: string;
  serverName: string;
  channels: Channel[];
  currentAuthor: MessageAuthor | null;
  serverRoles: Role[];
  myRoleIds: string[];
  onOpenResult: (message: Message) => void;
}

/**
 * Lupa del header y su modal. El estado vive aca y no en la pantalla del canal:
 * asi abrir el modal o escribir no vuelve a dibujar el chat entero.
 */
export function MessageSearchButton({
  serverId,
  serverName,
  channels,
  currentAuthor,
  serverRoles,
  myRoleIds,
  onOpenResult,
}: MessageSearchButtonProps) {
  const colors = useThemeColors();
  const [isVisible, setIsVisible] = useState(false);
  const form = useMessageSearchForm(serverId);

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsVisible(true)}
        className="w-8.5 h-8.5 items-center justify-center"
        accessibilityLabel={MESSAGE_SEARCH_LABEL}
        accessibilityRole="button"
      >
        <Feather name="search" size={20} color={colors.textMuted} />
      </TouchableOpacity>

      <MessageSearchModal
        visible={isVisible}
        serverId={serverId}
        serverName={serverName}
        channels={channels}
        form={form}
        currentAuthor={currentAuthor}
        serverRoles={serverRoles}
        myRoleIds={myRoleIds}
        onOpenResult={(message) => {
          setIsVisible(false);
          onOpenResult(message);
        }}
        onClose={() => setIsVisible(false)}
      />
    </>
  );
}
