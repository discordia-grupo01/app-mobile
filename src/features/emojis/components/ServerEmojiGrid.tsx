import { type ServerEmoji } from "@discordia/client-shared";
import { Image } from "expo-image";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { Avatar } from "../../../components/ui/Avatar";
import { resolveServerIconUrl } from "../../servers/api";
import { resolveEmojiImageUrl } from "../api";
import type { ServerEmojiSection } from "../useCustomEmojiPicker";
import { EmojiPremiumBadge } from "./EmojiPremiumBadge";

interface ServerEmojiGridProps {
  sections: ServerEmojiSection[];
  onPick: (emoji: ServerEmoji) => void;
}

export function ServerEmojiGrid({ sections, onPick }: ServerEmojiGridProps) {
  const hasAnyEmojis = sections.some((s) => s.emojis.length > 0);

  if (!hasAnyEmojis) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <Text className="text-center text-[13px] text-content-subtle">
          Este y otros servidores todavía no tienen emojis propios.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="p-4 gap-5"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {sections.map((section) => {
        if (section.emojis.length === 0) return null;

        return (
          <View key={section.serverId} className="gap-2.5">
            <View className="flex-row items-center gap-2">
              <Avatar
                name={section.serverName}
                uri={resolveServerIconUrl(section.iconUrl)}
                size={20}
                borderRadius={6}
              />
              <Text
                className="text-[12px] font-bold uppercase tracking-wider text-content-subtle"
                numberOfLines={1}
              >
                {section.serverName}
              </Text>
            </View>

            <View className="flex-row flex-wrap gap-2">
              {section.emojis.map(({ emoji, isLocked, tooltip }) => (
                <TouchableOpacity
                  key={emoji.id}
                  activeOpacity={0.7}
                  onPress={() => onPick(emoji)}
                  accessibilityRole="button"
                  accessibilityLabel={tooltip}
                  className="h-11 w-11 items-center justify-center rounded-xl bg-surface-input"
                >
                  <Image
                    source={{ uri: resolveEmojiImageUrl(emoji.image_url) }}
                    style={{ width: 28, height: 28 }}
                    contentFit="contain"
                  />
                  {isLocked ? (
                    <EmojiPremiumBadge
                      size={14}
                      className="absolute -top-1 -right-1"
                    />
                  ) : null}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}
