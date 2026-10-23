import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  EmojiKeyboard,
  emojisByCategory,
  es,
  useRecentPicksPersistence,
  type EmojisByCategory,
} from "rn-emoji-keyboard";
import {
  LogBox,
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useThemeColors } from "../../../theme/theme-context";

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

interface EmojiPickerSheetProps {
  visible: boolean;
  title: string;
  onPick: (emoji: string) => void;
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
  onPick,
  onClose,
}: EmojiPickerSheetProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  function handlePick(emoji: string) {
    onPick(emoji);
    onClose();
  }

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

        {/* Sin padding lateral: el teclado de emojis ya trae el suyo. */}
        <View
          accessibilityLabel={title}
          className="rounded-t-[22px] border-t border-line-strong bg-surface-modal pt-2.5"
          style={{ paddingBottom: insets.bottom }}
        >
          <View className="mb-3 h-1 w-9 self-center rounded-xs bg-line-strong" />

          {visible ? (
            <EmojiKeyboardBody
              onPick={handlePick}
              height={Math.round(height * 0.5)}
            />
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
