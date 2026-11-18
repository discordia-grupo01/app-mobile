import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  CUSTOM_EMOJI_PICKER_COPY,
  customEmojiToken,
  type ServerEmoji,
} from "@discordia/client-shared";
import {
  EmojiKeyboard,
  emojisByCategory,
  es,
  useRecentPicksPersistence,
  type EmojisByCategory,
} from "rn-emoji-keyboard";
import { useEffect, useState } from "react";
import {
  LogBox,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { cn } from "../../../lib/cn";
import { useThemeColors } from "../../../theme/theme-context";
import { DiscordiaPremiumIcon } from "../../billing/components/shared/DiscordiaIcons";
import { useOwnPremium } from "../../billing/useOwnPremium";
import { ServerEmojiGrid } from "../../emojis/components/ServerEmojiGrid";
import { useCustomEmojiPicker } from "../../emojis/useCustomEmojiPicker";

const RECENT_EMOJIS_KEY = "discordia_recent_emojis";

const CATEGORY_ORDER = [
  "recently_used",
  "smileys_emotion",
  "animals_nature",
  "food_drink",
  "activities",
  "travel_places",
  "objects",
  "symbols",
  "flags",
] as const;

const TRANSLATION = {
  ...es,
  recently_used: "Usados con frecuencia",
  smileys_emotion: "Emoticonos y personas",
  animals_nature: "Animales y naturaleza",
  food_drink: "Comida y bebida",
  activities: "Actividades",
  travel_places: "Viajes y destinos",
  objects: "Objetos",
  symbols: "Símbolos",
  flags: "Banderas",
};

const EMOJIS_BY_CATEGORY: EmojisByCategory[] = [
  {
    title: "smileys_emotion",
    data: emojisByCategory
      .filter(
        (category) =>
          category.title === "smileys_emotion" ||
          category.title === "people_body",
      )
      .flatMap((category) => category.data),
  },
  ...emojisByCategory.filter(
    (category) =>
      category.title !== "smileys_emotion" && category.title !== "people_body",
  ),
];

// rn-emoji-keyboard usa InteractionManager, deprecado en React Native 0.86: el
// aviso aparece solo en desarrollo y no afecta el funcionamiento.
LogBox.ignoreLogs(["InteractionManager has been deprecated"]);

export interface EmojiPickerSheetProps {
  visible: boolean;
  title: string;
  serverId?: string | null;
  onPick: (emoji: string) => void;
  onPickCustomEmoji?: (emoji: ServerEmoji) => void;
  onOpenPremium?: () => void;
  onClose: () => void;
}

function EmojiKeyboardBody({
  onPick,
  height,
}: {
  onPick: (emoji: string) => void;
  height: number;
}) {
  const colors = useThemeColors();

  useRecentPicksPersistence({
    initialization: async () => {
      const raw = await AsyncStorage.getItem(RECENT_EMOJIS_KEY);
      return raw ? JSON.parse(raw) : [];
    },
    onStateChange: (next) =>
      AsyncStorage.setItem(RECENT_EMOJIS_KEY, JSON.stringify(next)),
  });

  return (
    <View style={{ height }}>
      <EmojiKeyboard
        onEmojiSelected={(emoji) => onPick(emoji.emoji)}
        translation={TRANSLATION}
        emojisByCategory={EMOJIS_BY_CATEGORY}
        categoryOrder={[...CATEGORY_ORDER]}
        enableSearchBar
        enableRecentlyUsed
        categoryPosition="bottom"
        disableSafeArea
        styles={{
          container: { borderRadius: 0, shadowOpacity: 0, elevation: 0 },
        }}
        theme={{
          container: "transparent",
          header: colors.textSubtle,
          knob: colors.borderStrong,
          skinTonesContainer: colors.bgCard,
          category: {
            icon: colors.textSubtle,
            iconActive: colors.accentBright,
            container: colors.bgInput,
            containerActive: colors.bgHover,
          },
          search: {
            background: colors.bgInput,
            text: colors.text,
            placeholder: colors.textSubtle,
            icon: colors.textSubtle,
          },
          emoji: { selected: colors.bgHover },
        }}
      />
    </View>
  );
}

export function EmojiPickerSheet({
  visible,
  title,
  serverId = null,
  onPick,
  onPickCustomEmoji,
  onOpenPremium,
  onClose,
}: EmojiPickerSheetProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<"standard" | "server">("standard");

  const isPremium = useOwnPremium();
  const catalog = useCustomEmojiPicker(serverId, isPremium);

  useEffect(() => {
    if (visible) {
      catalog.load();
    }
  }, [visible, catalog]);

  function handlePickStandard(emoji: string) {
    onPick(emoji);
    onClose();
  }

  function handlePickCustom(emoji: ServerEmoji) {
    if (onPickCustomEmoji) {
      onPickCustomEmoji(emoji);
    } else {
      onPick(customEmojiToken(emoji));
    }
    onClose();
  }

  function handleOpenPremium() {
    onClose();
    onOpenPremium?.();
  }

  const pickerHeight = Math.round(height * 0.52);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-[rgba(0,0,0,0.55)]">
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Cerrar"
        />

        <View
          accessibilityLabel={title}
          className="rounded-t-[22px] border-t border-line-strong bg-surface-modal pt-2.5"
          style={{ paddingBottom: insets.bottom }}
        >
          <View className="mb-2 h-1 w-9 self-center rounded-xs bg-line-strong" />

          {/* Solapas */}
          <View className="mx-4 mb-2 flex-row rounded-xl border border-line bg-surface-input p-1">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setActiveTab("standard")}
              className={cn(
                "flex-1 items-center justify-center rounded-lg py-1.5",
                activeTab === "standard" ? "bg-surface-raised shadow-xs" : "",
              )}
            >
              <Text
                className={cn(
                  "text-[13px] font-bold",
                  activeTab === "standard"
                    ? "text-content"
                    : "text-content-muted",
                )}
              >
                Estándar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setActiveTab("server")}
              className={cn(
                "flex-1 items-center justify-center rounded-lg py-1.5",
                activeTab === "server" ? "bg-surface-raised shadow-xs" : "",
              )}
            >
              <Text
                className={cn(
                  "text-[13px] font-bold",
                  activeTab === "server"
                    ? "text-content"
                    : "text-content-muted",
                )}
              >
                Del servidor
              </Text>
            </TouchableOpacity>
          </View>

          {/* Contenido de la solapa */}
          {visible ? (
            activeTab === "standard" ? (
              <EmojiKeyboardBody
                onPick={handlePickStandard}
                height={pickerHeight}
              />
            ) : (
              <View style={{ height: pickerHeight }}>
                <ServerEmojiGrid
                  sections={catalog.sections}
                  onPick={handlePickCustom}
                />
              </View>
            )
          ) : null}

          {/* Pie informativo de Premium */}
          {catalog.hasLocked ? (
            <View className="flex-row items-center justify-between border-t border-line px-4 py-2.5">
              <Text
                className="flex-1 text-[12px] text-content-muted"
                numberOfLines={1}
              >
                {CUSTOM_EMOJI_PICKER_COPY.note}
              </Text>
              {onOpenPremium ? (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleOpenPremium}
                  className="flex-row items-center gap-1 pl-2"
                >
                  <DiscordiaPremiumIcon size={14} />
                  <Text className="text-[12px] font-bold text-[#F0B232]">
                    {CUSTOM_EMOJI_PICKER_COPY.cta}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
