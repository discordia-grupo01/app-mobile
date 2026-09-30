import type { MessageAuthor, ServerSummary } from "@discordia/client-shared";

import { useState } from "react";
import { View } from "react-native";

import { DmConversationList } from "../features/direct-messages/components/DmConversationList";
import { DmConversationScreen } from "../features/direct-messages/components/DmConversationScreen";
import { StartDmSheet } from "../features/direct-messages/components/StartDmSheet";
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
    activeConversationId,
    activeMessages,
    activeSummary,
    knownPartners,
    openConversation,
    closeConversation,
    startConversationWith,
    sendMessage,
    editMessage,
    deleteMessage,
  } = directMessages;

  if (currentAuthor && activeConversationId && activeSummary) {
    return (
      <DmConversationScreen
        currentAuthor={currentAuthor}
        summary={activeSummary}
        messages={activeMessages}
        onSend={sendMessage}
        onEditMessage={editMessage}
        onDeleteMessage={deleteMessage}
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
        activeConversationId={activeConversationId}
        userName={userName}
        onSelect={openConversation}
        onStartNew={() => setIsStartSheetVisible(true)}
        onLogout={onLogout}
      />

      <StartDmSheet
        visible={isStartSheetVisible}
        partners={knownPartners}
        onClose={() => setIsStartSheetVisible(false)}
        onStart={(partnerId) => {
          startConversationWith(partnerId);
          setIsStartSheetVisible(false);
        }}
      />
    </View>
  );
}
