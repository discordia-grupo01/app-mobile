import {
  BLOCKED_BADGE_LABEL,
  type ConversationSummary,
  type MessageAuthor,
  type SendDmResult,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PublicProfileModal } from "../../profile/components/PublicProfileModal";
import { Avatar } from "../../../components/ui/Avatar";
import { useThemeColors } from "../../../theme/theme-context";
import { DmThread } from "./DmThread";

interface DmConversationScreenProps {
  currentAuthor: MessageAuthor;
  summary: ConversationSummary;
  onSend: (
    content: string,
    attachmentIds?: readonly string[],
    clientId?: string,
  ) => Promise<SendDmResult>;
  /** La sala personal esta unida: solo entonces se puede enviar. */
  isConnected: boolean;
  onBack: () => void;
}

export function DmConversationScreen({
  currentAuthor,
  summary,
  onSend,
  isConnected,
  onBack,
}: DmConversationScreenProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const { partner, blockedByMe, conversationId } = summary;

  return (
    <View className="flex-1 bg-surface">
      <View
        className="min-h-15 flex-row items-center gap-3 border-b border-b-line px-3"
        style={{ paddingTop: insets.top }}
      >
        <TouchableOpacity
          onPress={onBack}
          className="h-8.5 w-8.5 items-center justify-center"
          accessibilityLabel="Volver"
        >
          <Feather name="arrow-left" size={22} color={colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setIsProfileVisible(true)}
          className="flex-1 flex-row items-center gap-3"
          accessibilityRole="button"
          accessibilityLabel={`Ver perfil de ${partner.name}`}
        >
          <Avatar name={partner.name} uri={partner.avatarUrl} size={30} />
          <Text
            className="flex-1 text-[17px] font-bold text-content"
            numberOfLines={1}
          >
            {partner.name}
          </Text>
        </TouchableOpacity>
        {blockedByMe ? (
          <View className="rounded-full bg-danger/15 px-2 py-1">
            <Text className="text-[10px] text-danger">
              {BLOCKED_BADGE_LABEL}
            </Text>
          </View>
        ) : null}
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <DmThread
          key={conversationId ?? partner.id}
          conversationId={conversationId}
          partner={partner}
          currentAuthor={currentAuthor}
          blockedByMe={blockedByMe}
          onSend={onSend}
          isConnected={isConnected}
        />
      </KeyboardAvoidingView>

      <PublicProfileModal
        visible={isProfileVisible}
        userId={partner.id}
        canBlock
        onClose={() => setIsProfileVisible(false)}
      />
    </View>
  );
}
