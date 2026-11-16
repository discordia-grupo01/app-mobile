import {
  ADD_REACTION_LABEL,
  DELETE_MESSAGE_LABEL,
  EDIT_MESSAGE_LABEL,
  REPORT_MESSAGE_LABEL,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useThemeColors } from "../../../theme/theme-context";

interface MessageActionsSheetProps {
  visible: boolean;
  canEdit: boolean;
  canDelete: boolean;
  /** Ausente en DMs: no hay reacciones ahi. */
  onReact?: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReport?: () => void;
  onClose: () => void;
}

/** Menú de mantener presionado sobre un mensaje: reaccionar, editar, eliminar, reportar. */
export function MessageActionsSheet({
  visible,
  canEdit,
  canDelete,
  onReact,
  onEdit,
  onDelete,
  onReport,
  onClose,
}: MessageActionsSheetProps) {
  const colors = useThemeColors();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-[rgba(0,0,0,0.6)]">
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View className="rounded-tl-[22px] rounded-tr-[22px] border-t border-line-strong bg-surface-modal px-4.5 pt-2.5 pb-7">
          <View className="mb-4 h-1 w-9 self-center rounded-xs bg-line-strong" />

          {onReact ? (
            <TouchableOpacity
              activeOpacity={0.75}
              className="flex-row items-center gap-3.5 rounded-[14px] px-2 py-3"
              onPress={onReact}
            >
              <View className="h-9.5 w-9.5 items-center justify-center rounded-[11px] bg-[rgba(107,149,189,0.15)]">
                <Feather name="smile" size={16} color={colors.info} />
              </View>
              <Text className="text-[15px] font-bold text-content">
                {ADD_REACTION_LABEL}
              </Text>
            </TouchableOpacity>
          ) : null}

          {canEdit ? (
            <TouchableOpacity
              activeOpacity={0.75}
              className="flex-row items-center gap-3.5 rounded-[14px] px-2 py-3"
              onPress={onEdit}
            >
              <View className="h-9.5 w-9.5 items-center justify-center rounded-[11px] bg-[rgba(107,149,189,0.15)]">
                <Feather name="edit-2" size={16} color={colors.info} />
              </View>
              <Text className="text-[15px] font-bold text-content">
                {EDIT_MESSAGE_LABEL}
              </Text>
            </TouchableOpacity>
          ) : null}

          {canDelete ? (
            <TouchableOpacity
              activeOpacity={0.75}
              className="flex-row items-center gap-3.5 rounded-[14px] px-2 py-3"
              onPress={onDelete}
            >
              <View className="h-9.5 w-9.5 items-center justify-center rounded-[11px] bg-[rgba(224,82,82,0.12)]">
                <Feather name="trash-2" size={16} color={colors.danger} />
              </View>
              <Text className="text-[15px] font-bold text-danger">
                {DELETE_MESSAGE_LABEL}
              </Text>
            </TouchableOpacity>
          ) : null}

          {onReport ? (
            <TouchableOpacity
              activeOpacity={0.75}
              className="flex-row items-center gap-3.5 rounded-[14px] px-2 py-3"
              onPress={onReport}
            >
              <View className="h-9.5 w-9.5 items-center justify-center rounded-[11px] bg-[rgba(224,82,82,0.12)]">
                <Feather name="flag" size={16} color={colors.danger} />
              </View>
              <Text className="text-[15px] font-bold text-danger">
                {REPORT_MESSAGE_LABEL}
              </Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.75}
            className="mt-2 items-center rounded-xl bg-surface-input py-3.5"
            onPress={onClose}
          >
            <Text className="text-[14px] font-bold text-content-muted">
              Cancelar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
