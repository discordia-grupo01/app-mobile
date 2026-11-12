import {
  BLOCKED_BADGE_LABEL,
  DIRECT_MESSAGES_TITLE,
  type ConversationSummary,
  NO_CONVERSATIONS_YET,
  stripMessageMarkdown,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { UserProfileBar } from "../../servers/components/account/UserProfileBar";
import { Avatar } from "../../../components/ui/Avatar";
import { useThemeColors } from "../../../theme/theme-context";
import { cn } from "../../../lib/cn";
import { UserActivityStatusDot } from "../../profile/components/ActivityStatusDot";
import { DmListError } from "./DmListError";

interface DmConversationListProps {
  conversations: ConversationSummary[];
  isLoading: boolean;
  loadError: string | null;
  /** La lista no cargo y tampoco hay conexion. */
  isOffline: boolean;
  onRetryLoad: () => void;
  activePartnerId: string | null;
  userName?: string | null;
  onSelect: (partnerId: string) => void;
  onStartNew: () => void;
  onLogout: () => void;
}

export function DmConversationList({
  conversations,
  isLoading,
  loadError,
  isOffline,
  onRetryLoad,
  activePartnerId,
  userName,
  onSelect,
  onStartNew,
  onLogout,
}: DmConversationListProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-surface-sunken">
      <View
        className="flex-row items-center justify-between border-b border-b-line px-4"
        style={{ paddingTop: insets.top, minHeight: insets.top + 52 }}
      >
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
        {isLoading ? (
          <View className="items-center py-6">
            <ActivityIndicator color={colors.accentBright} />
          </View>
        ) : conversations.length === 0 && loadError ? (
          <DmListError
            message={loadError}
            isOffline={isOffline}
            onRetry={onRetryLoad}
          />
        ) : conversations.length === 0 ? (
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
                    "relative mb-0.5 flex-row items-center gap-2.5 rounded-lg px-2 py-2.5",
                    isActive && "bg-accent/20",
                  )}
                >
                  {isUnread ? (
                    <View className="absolute left-0 top-1/2 -mt-1 h-2 w-1 rounded-r-full bg-content" />
                  ) : null}
                  <View className="relative">
                    <Avatar
                      name={partner.name}
                      uri={partner.avatarUrl}
                      size={38}
                    />
                    <UserActivityStatusDot
                      userId={partner.id}
                      className="absolute -right-[1px] -bottom-[1px] border-surface-sunken"
                    />
                  </View>
                  <View className="min-w-0 flex-1">
                    <View className="flex-row items-center justify-between gap-1">
                      <Text
                        className={cn(
                          "flex-1 text-[15px] font-semibold text-content",
                          isUnread && "font-bold",
                        )}
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
                        {stripMessageMarkdown(lastMessage.content)}
                      </Text>
                    ) : null}
                  </View>
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
