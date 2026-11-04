import {
  ALLOWED_SERVER_ICON_TYPES,
  formatImageTypes,
  MAX_ICON_FILE_MB,
} from "@discordia/client-shared";
import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { Avatar } from "../../../../../components/ui/Avatar";
import { FieldError } from "../../../../../components/ui/FieldError";
import { useThemeColors } from "../../../../../theme/theme-context";

interface ServerIconPickerProps {
  serverName: string;
  iconUri: string | undefined;
  error: string;
  onPick: () => void;
  onRemove: () => void;
}

export function ServerIconPicker({
  serverName,
  iconUri,
  error,
  onPick,
  onRemove,
}: ServerIconPickerProps) {
  const colors = useThemeColors();

  return (
    <View className="items-center gap-2.5 mb-6">
      <TouchableOpacity activeOpacity={0.85} onPress={onPick}>
        <Avatar name={serverName} uri={iconUri} size={96} />
      </TouchableOpacity>

      <View className="flex-row items-center gap-2.5">
        <TouchableOpacity
          className="flex-row items-center gap-1.5 rounded-lg border border-line bg-surface-input px-3 py-[7px]"
          onPress={onPick}
        >
          <Feather name="edit-2" size={11} color={colors.textMuted} />
          <Text className="text-[12px] font-semibold text-content-muted">
            {iconUri ? "Cambiar imagen" : "Subir imagen"}
          </Text>
        </TouchableOpacity>
        {iconUri ? (
          <TouchableOpacity onPress={onRemove}>
            <Text className="text-[12px] font-semibold text-danger">
              Quitar
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <FieldError message={error} />

      <Text className="text-[11px] text-content-subtle text-center">
        {formatImageTypes(ALLOWED_SERVER_ICON_TYPES)} · Máx. {MAX_ICON_FILE_MB}{" "}
        MB
      </Text>
    </View>
  );
}
