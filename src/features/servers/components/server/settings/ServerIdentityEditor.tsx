import {
  ADD_BANNER_LABEL,
  CHANGE_BANNER_LABEL,
  CHANGE_SERVER_ICON_LABEL,
  type PresetBanner,
  REMOVE_BANNER_LABEL,
} from "@discordia/client-shared";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { Avatar } from "../../../../../components/ui/Avatar";
import { useThemeColors } from "../../../../../theme/theme-context";
import { ServerBanner } from "../../ServerBanner";
import { PresetGradientFill } from "./PresetGradientFill";

const BANNER_HEIGHT = 120;
const ICON_SIZE = 84;
const ICON_RING = 4;
const ICON_BOX = ICON_SIZE + ICON_RING * 2;

interface ServerIdentityEditorProps {
  serverName: string;
  iconUri: string | null | undefined;
  bannerUri: string | null | undefined;
  bannerPreset: PresetBanner | null;
  onPickIcon: () => void;
  onPickBanner: () => void;
  onRemoveBanner: () => void;
}

export function ServerIdentityEditor({
  serverName,
  iconUri,
  bannerUri,
  bannerPreset,
  onPickIcon,
  onPickBanner,
  onRemoveBanner,
}: ServerIdentityEditorProps) {
  const colors = useThemeColors();

  return (
    <View
      className="mx-7 mt-6"
      style={{ height: BANNER_HEIGHT + ICON_BOX / 2 }}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPickBanner}
        className="w-full rounded-2xl bg-surface-raised overflow-hidden border border-line-strong"
        style={{ height: BANNER_HEIGHT }}
        accessibilityRole="button"
        accessibilityLabel={CHANGE_BANNER_LABEL}
      >
        {bannerPreset ? (
          <PresetGradientFill preset={bannerPreset} idPrefix="preview" />
        ) : bannerUri ? (
          <ServerBanner uri={bannerUri} height={BANNER_HEIGHT} />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Feather name="image" size={20} color={colors.textSubtle} />
            <Text className="text-[11px] text-content-subtle mt-1.5">
              {ADD_BANNER_LABEL}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <View
        pointerEvents="none"
        className="absolute right-2.5 top-2.5 w-7 h-7 rounded-2xl items-center justify-center bg-[rgba(0,0,0,0.55)]"
      >
        <Feather name="camera" size={13} color="#ffffff" />
      </View>

      {bannerUri ? (
        <TouchableOpacity
          onPress={onRemoveBanner}
          className="absolute left-2.5 top-2.5 w-7 h-7 rounded-2xl items-center justify-center bg-[rgba(0,0,0,0.55)]"
          accessibilityRole="button"
          accessibilityLabel={REMOVE_BANNER_LABEL}
        >
          <Feather name="x" size={13} color="#ffffff" />
        </TouchableOpacity>
      ) : null}

      <View
        className="absolute left-4 bottom-0"
        style={{ width: ICON_BOX, height: ICON_BOX }}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onPickIcon}
          className="bg-surface-modal rounded-full items-center justify-center"
          style={{ width: ICON_BOX, height: ICON_BOX }}
          accessibilityRole="button"
          accessibilityLabel={CHANGE_SERVER_ICON_LABEL}
        >
          <Avatar name={serverName} uri={iconUri} size={ICON_SIZE} />
        </TouchableOpacity>
        <View
          pointerEvents="none"
          className="absolute right-0 bottom-0 w-6 h-6 rounded-xl items-center justify-center bg-[rgba(0,0,0,0.65)] border-2 border-surface-modal"
        >
          <Feather name="camera" size={11} color="#ffffff" />
        </View>
      </View>
    </View>
  );
}
