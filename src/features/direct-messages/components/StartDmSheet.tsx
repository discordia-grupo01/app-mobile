import {
  NEW_DIRECT_MESSAGE_LABEL,
  type MessageAuthor,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ServerAvatar } from "../../servers/components/ServerAvatar";
import { useThemeColors } from "../../../theme/theme-context";

interface StartDmSheetProps {
  visible: boolean;
  partners: MessageAuthor[];
  onClose: () => void;
  onStart: (partnerId: string) => void;
}

export function StartDmSheet({
  visible,
  partners,
  onClose,
  onStart,
}: StartDmSheetProps) {
  const colors = useThemeColors();
  const [query, setQuery] = useState("");
  const filtered = partners.filter((partner) =>
    partner.name.toLowerCase().includes(query.toLowerCase()),
  );

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
            {NEW_DIRECT_MESSAGE_LABEL}
          </Text>

          <View className="mb-2 flex-row items-center gap-2 rounded-lg border border-line bg-surface-input px-3 py-2">
            <Feather name="search" size={14} color={colors.textSubtle} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar por nombre..."
              placeholderTextColor={colors.textSubtle}
              className="flex-1 text-[14px] text-content"
            />
          </View>

          {filtered.length === 0 ? (
            <Text className="px-2 py-4 text-center text-[13px] text-content-subtle">
              Sin resultados
            </Text>
          ) : (
            filtered.map((partner) => (
              <TouchableOpacity
                key={partner.id}
                activeOpacity={0.75}
                onPress={() => onStart(partner.id)}
                className="flex-row items-center gap-3 rounded-lg px-2 py-2.5"
              >
                <ServerAvatar
                  name={partner.name}
                  uri={partner.avatarUrl}
                  size={34}
                />
                <Text className="text-[15px] font-medium text-content">
                  {partner.name}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </View>
    </Modal>
  );
}
