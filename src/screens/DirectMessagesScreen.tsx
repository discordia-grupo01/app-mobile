import type {
  MessageAuthor,
  ServerSummary,
  UnreadFlags,
} from "@discordia/client-shared";

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
  unreadByServer?: Record<string, UnreadFlags>;
  onLogout: () => void;
}

export function DirectMessagesScreen({
  servers,
  userName,
  currentAuthor,
  directMessages,
  unreadByServer,
  onSwitchServer,
  onAddServer,
  onLogout,
}: DirectMessagesScreenProps) {
  const [isStartSheetVisible, setIsStartSheetVisible] = useState(false);
  const {
    conversations,
    isLoading,
    loadError,
    activeSummary,
    openConversation,
    closeConversation,
    sendMessage,
    isConnected,
    retry,
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
        isConnected={isConnected}
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
        unreadByServer={unreadByServer}
        onOpenDirectMessages={() => {}}
        onSelectServer={onSwitchServer}
        onAddServer={onAddServer}
      />

      <DmConversationList
        conversations={conversations}
        isLoading={isLoading}
        loadError={loadError}
        isOffline={loadError !== null && !isConnected}
        onRetryLoad={retry}
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
