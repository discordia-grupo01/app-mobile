import {
  displayNameOf,
  matchesSearch,
  type Member,
  MESSAGE_SEARCH_ANY_AUTHOR,
  MESSAGE_SEARCH_AUTHOR_PLACEHOLDER,
  MESSAGE_SEARCH_NO_MEMBERS,
  MESSAGE_SEARCH_PICK_AUTHOR,
  resolveImageUrl,
} from "@discordia/client-shared";
import { Feather } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Avatar } from "../../../components/ui/Avatar";
import { SearchInput } from "../../../components/ui/SearchInput";
import { env } from "../../../lib/env";
import { cn } from "../../../lib/cn";
import { useThemeColors } from "../../../theme/theme-context";

interface AuthorPickerSheetProps {
  visible: boolean;
  members: Member[] | null;
  selectedId: string | null;
  onPick: (authorId: string | null) => void;
  onClose: () => void;
}

/** Hoja con los miembros del servidor para filtrar por autor. */
export function AuthorPickerSheet({
  visible,
  members,
  selectedId,
  onPick,
  onClose,
}: AuthorPickerSheetProps) {
  const colors = useThemeColors();
  const [query, setQuery] = useState("");
  const options = useMemo(
    () =>
      (members ?? [])
        .map((member) => ({
          id: member.user_id,
          name: displayNameOf(member.profile),
          avatarUrl: resolveImageUrl(member.profile?.avatar_url, env.apiUrl),
        }))
        .filter((option) => matchesSearch(option.name, query))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [members, query],
  );

  function pick(authorId: string | null) {
    onPick(authorId);
    onClose();
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-[rgba(0,0,0,0.6)]">
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View className="max-h-[75%] rounded-tl-[22px] rounded-tr-[22px] border-t border-line-strong bg-surface-modal px-4.5 pt-2.5 pb-7">
          <View className="mb-4 h-1 w-9 self-center rounded-xs bg-line-strong" />
          <Text className="mb-3 text-[17px] font-bold text-content">
            {MESSAGE_SEARCH_PICK_AUTHOR}
          </Text>
          <View className="mb-2">
            <SearchInput
              value={query}
              onChange={setQuery}
              label={MESSAGE_SEARCH_AUTHOR_PLACEHOLDER}
              placeholder={MESSAGE_SEARCH_AUTHOR_PLACEHOLDER}
            />
          </View>

          <TouchableOpacity
            onPress={() => pick(null)}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedId === null }}
            className={cn(
              "flex-row items-center gap-3 rounded-lg px-2 py-2.5",
              selectedId === null && "bg-surface-hover",
            )}
          >
            <View className="h-[34px] w-[34px] items-center justify-center rounded-full bg-surface-raised">
              <Feather name="users" size={16} color={colors.textMuted} />
            </View>
            <Text className="text-[15px] font-medium text-content">
              {MESSAGE_SEARCH_ANY_AUTHOR}
            </Text>
          </TouchableOpacity>

          <FlatList
            data={options}
            keyExtractor={(option) => option.id}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text className="px-2 py-4 text-center text-[13px] text-content-subtle">
                {MESSAGE_SEARCH_NO_MEMBERS}
              </Text>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => pick(item.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedId === item.id }}
                className={cn(
                  "flex-row items-center gap-3 rounded-lg px-2 py-2.5",
                  selectedId === item.id && "bg-surface-hover",
                )}
              >
                <Avatar name={item.name} uri={item.avatarUrl} size={34} />
                <Text
                  className="shrink text-[15px] font-medium text-content"
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}
