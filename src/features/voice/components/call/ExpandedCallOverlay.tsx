import {
  VOICE_FULLSCREEN_EXIT,
  VOICE_FULLSCREEN_EXIT_LABEL,
  VOICE_FULLSCREEN_HINT,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { cn } from "../../../../lib/cn";
import { useAutoHide } from "../../useAutoHide";

interface ExpandedCallOverlayProps {
  name: string;
  source: "camera" | "screen";
  onExit: () => void;
}

export function ExpandedCallOverlay({
  name,
  source,
  onExit,
}: ExpandedCallOverlayProps) {
  const insets = useSafeAreaInsets();
  const { isVisible, toggle } = useAutoHide();

  return (
    <Pressable
      style={StyleSheet.absoluteFill}
      onPress={toggle}
      accessibilityRole="button"
      accessibilityLabel={name}
    >
      <StatusBar hidden />
      <View
        pointerEvents={isVisible ? "box-none" : "none"}
        className={cn(
          "flex-1 justify-between",
          isVisible ? "opacity-100" : "opacity-0",
        )}
        style={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 16,
          paddingLeft: insets.left + 16,
          paddingRight: insets.right + 16,
        }}
      >
        <View className="flex-row items-center justify-between gap-4">
          <View className="min-w-0 flex-1 flex-row items-center gap-2">
            <Feather
              name={source === "screen" ? "monitor" : "video"}
              size={18}
              color="#ffffff"
            />
            <Text
              className="flex-1 text-[16px] font-semibold text-white"
              numberOfLines={1}
            >
              {name}
            </Text>
          </View>
          <Pressable
            onPress={onExit}
            accessibilityRole="button"
            accessibilityLabel={VOICE_FULLSCREEN_EXIT_LABEL}
            hitSlop={8}
            className="flex-row items-center gap-1.5 rounded-xl border border-white/15 bg-black/50 px-4 py-2"
          >
            <Feather name="x" size={16} color="#ffffff" />
            <Text className="text-[14px] font-semibold text-white">
              {VOICE_FULLSCREEN_EXIT}
            </Text>
          </Pressable>
        </View>

        <View className="flex-row items-center gap-2 self-center rounded-full bg-black/60 px-4 py-2">
          <Feather name="volume-2" size={14} color="rgba(255,255,255,0.85)" />
          <Text className="text-[13px] text-white/85">
            {VOICE_FULLSCREEN_HINT}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
