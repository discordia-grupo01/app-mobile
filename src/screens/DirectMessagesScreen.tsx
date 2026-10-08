import type { MessageAuthor, ServerSummary } from "@discordia/client-shared";

import { useState } from "react";
import { View } from "react-native";

import { DmConversationList } from "../features/direct-messages/components/DmConversationList";
import { DmConversationScreen } from "../features/direct-messages/components/DmConversationScreen";
import { StartDmSheet } from "../features/direct-messages/components/StartDmSheet";
import { useDmCandidates } from "../features/direct-messages/useDmCandidates";
import type { useDirectMessages } from "../features/direct-messages/useDirectMessages";
import { ServerRail } from "../features/servers/components/rail/ServerRail";

interface DirectMessagesScreenProps {
  servers: ServerSummary[];
  userName?: string | null;
  currentAuthor: MessageAuthor | null;
  directMessages: ReturnType<typeof useDirectMessages>;
  onSwitchServer: (serverId: string) => void;
  onAddServer: () => void;
  onLogout: () => void;
}

/** Puramente presentacional: el estado de los DMs vive en `HomeScreen` (`useDirectMessages`), para que sobreviva a cambiar de vista. */
export function DirectMessagesScreen({
  servers,
  userName,
  currentAuthor,
  directMessages,
  onSwitchServer,
  onAddServer,
  onLogout,
}: DirectMessagesScreenProps) {
  const [isStartSheetVisible, setIsStartSheetVisible] = useState(false);
  const {
    conversations,
    activeSummary,
    openConversation,
    closeConversation,
    sendMessage,
  } = directMessages;
  const { candidates, isLoading: isLoadingCandidates } = useDmCandidates(
    servers,
    currentAuthor?.id ?? null,
    isStartSheetVisible,
  );

  if (currentAuthor && activeSummary) {
    return (
      <DmConversationScreen
        currentAuthor={currentAuthor}
        summary={activeSummary}
        onSend={sendMessage}
        onBack={closeConversation}
      />
    );
  }

  return (
    <View className="flex-1 flex-row bg-surface-sunken">
      <ServerRail
        servers={servers}
        activeServerId={null}
        isDirectMessagesActive
        onOpenDirectMessages={() => {}}
        onSelectServer={onSwitchServer}
        onAddServer={onAddServer}
      />

      <DmConversationList
        conversations={conversations}
        activePartnerId={activeSummary?.partner.id ?? null}
        userName={userName}
        onSelect={openConversation}
        onStartNew={() => setIsStartSheetVisible(true)}
        onLogout={onLogout}
      />

      <StartDmSheet
        visible={isStartSheetVisible}
        partners={candidates}
        isLoading={isLoadingCandidates}
        onClose={() => setIsStartSheetVisible(false)}
        onStart={(partner) => {
          openConversation(partner.id, partner);
          setIsStartSheetVisible(false);
        }}
      />
    </View>
  );
}
