import {
  BLOCKED_BADGE_LABEL,
  DIRECT_MESSAGES_TITLE,
  type ConversationSummary,
  NO_CONVERSATIONS_YET,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { UserProfileBar } from "../../servers/components/account/UserProfileBar";
import { Avatar } from "../../../components/ui/Avatar";
import { useThemeColors } from "../../../theme/theme-context";
import { cn } from "../../../lib/cn";

interface DmConversationListProps {
  conversations: ConversationSummary[];
  activePartnerId: string | null;
  userName?: string | null;
  onSelect: (partnerId: string) => void;
  onStartNew: () => void;
  onLogout: () => void;
}

export function DmConversationList({
  conversations,
  activePartnerId,
  userName,
  onSelect,
  onStartNew,
  onLogout,
}: DmConversationListProps) {
  const colors = useThemeColors();

  return (
    <View className="flex-1 bg-surface-sunken">
      <View className="min-h-13 flex-row items-center justify-between border-b border-b-line px-4">
        <Text className="text-[15px] font-bold text-content">
          {DIRECT_MESSAGES_TITLE}
        </Text>
        <TouchableOpacity
          onPress={onStartNew}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Nuevo mensaje directo"
          accessibilityRole="button"
        >
          <Feather name="edit" size={18} color={colors.textSubtle} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerClassName="px-2 py-2">
        {conversations.length === 0 ? (
          <Text className="px-2 py-3 text-[13px] text-content-subtle">
            {NO_CONVERSATIONS_YET}
          </Text>
        ) : (
          conversations.map(
            ({
              conversationId,
              partner,
              lastMessage,
              isUnread,
              blockedByMe,
            }) => {
              const isActive = partner.id === activePartnerId;
              return (
                <TouchableOpacity
                  key={conversationId}
                  onPress={() => onSelect(partner.id)}
                  activeOpacity={0.75}
                  className={cn(
                    "mb-0.5 flex-row items-center gap-2.5 rounded-lg px-2 py-2.5",
                    isActive && "bg-accent/20",
                  )}
                >
                  <Avatar
                    name={partner.name}
                    uri={partner.avatarUrl}
                    size={38}
                  />
                  <View className="min-w-0 flex-1">
                    <View className="flex-row items-center justify-between gap-1">
                      <Text
                        className="flex-1 text-[15px] font-semibold text-content"
                        numberOfLines={1}
                      >
                        {partner.name}
                      </Text>
                      {blockedByMe ? (
                        <View className="rounded bg-danger/15 px-1 py-px">
                          <Text className="text-[9px] text-danger">
                            {BLOCKED_BADGE_LABEL}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    {lastMessage ? (
                      <Text
                        className="text-[12px] text-content-subtle"
                        numberOfLines={1}
                      >
                        {lastMessage.content}
                      </Text>
                    ) : null}
                  </View>
                  {isUnread ? (
                    <View className="h-2 w-2 rounded-full bg-danger" />
                  ) : null}
                </TouchableOpacity>
              );
            },
          )
        )}
      </ScrollView>

      <UserProfileBar userName={userName} onLogout={onLogout} />
    </View>
  );
}
