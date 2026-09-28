import {
  ALREADY_MEMBER_SUFFIX,
  INVITE_CODE_REQUIRED,
  JOINED_SERVER_SUFFIX,
  normalizeInviteCode,
  type ServerSummary,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { cn } from "../../../../lib/cn";
import { useThemeColors } from "../../../../theme/theme-context";
import { joinServerByCode, resolveServerIconUrl } from "../../api";
import { Button } from "../../../../components/ui/Button";
import { ServerAvatar } from "../ServerAvatar";

interface JoinServerModalProps {
  visible: boolean;
  onClose: () => void;
  onJoined: (server: ServerSummary) => void;
}

export function JoinServerModal({
  visible,
  onClose,
  onJoined,
}: JoinServerModalProps) {
  const colors = useThemeColors();
  const [code, setCode] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [joined, setJoined] = useState<{
    server: ServerSummary;
    alreadyMember: boolean;
  } | null>(null);
  const [wasVisible, setWasVisible] = useState(visible);

  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setCode("");
      setFieldError("");
      setGlobalError("");
      setIsSubmitting(false);
      setJoined(null);
    }
  }

  async function handleSubmit() {
    setFieldError("");
    setGlobalError("");

    const trimmed = code.trim();
    if (!trimmed) {
      setFieldError(INVITE_CODE_REQUIRED);
      return;
    }

    setIsSubmitting(true);
    const result = await joinServerByCode(normalizeInviteCode(trimmed));
    setIsSubmitting(false);

    if (!result.ok) {
      if (result.fieldErrors?.code) setFieldError(result.fieldErrors.code);
      else setGlobalError(result.message);
      return;
    }

    setJoined({ server: result.server, alreadyMember: result.alreadyMember });
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        className="flex-1 bg-[rgba(0,0,0,0.65)] items-center justify-center p-4"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View className="w-full max-w-110 max-h-[90%] rounded-[20px] border border-line-strong bg-surface-modal overflow-hidden">
          <TouchableOpacity
            onPress={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-2xl items-center justify-center bg-surface-input border border-line"
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
          >
            <Feather name="x" size={13} color={colors.textSubtle} />
          </TouchableOpacity>

          <ScrollView
            contentContainerClassName="p-7 pt-8"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {joined ? (
              <View className="items-center gap-5">
                <ServerAvatar
                  name={joined.server.name}
                  uri={resolveServerIconUrl(joined.server.icon_url)}
                  size={64}
                  borderRadius={20}
                />

                <View className="items-center gap-1.5">
                  <View className="w-12 h-12 rounded-2xl items-center justify-center bg-[rgba(56,161,105,0.15)] mb-1">
                    <Feather name="check" size={26} color={colors.success} />
                  </View>
                  <Text className="text-[16px] font-bold text-content">
                    {joined.alreadyMember
                      ? "Ya sos miembro"
                      : "¡Listo, te uniste!"}
                  </Text>
                  <Text className="text-[13px] leading-[19px] text-content-muted text-center max-w-65">
                    <Text className="text-content font-bold">
                      {joined.server.name}
                    </Text>
                    {joined.alreadyMember
                      ? ALREADY_MEMBER_SUFFIX
                      : JOINED_SERVER_SUFFIX}
                  </Text>
                </View>

                <Button
                  title="Ir al servidor"
                  onPress={() => onJoined(joined.server)}
                />
              </View>
            ) : (
              <View>
                <View className="flex-row items-center gap-3 mb-5 pr-6">
                  <View className="w-9 h-9 rounded-xl items-center justify-center bg-[rgba(107,149,189,0.15)]">
                    <Feather name="link-2" size={17} color={colors.info} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[17px] font-bold text-content">
                      Unirme con enlace
                    </Text>
                    <Text className="text-[12px] text-content-subtle mt-0.5">
                      Pegá el enlace o código de invitación
                    </Text>
                  </View>
                </View>

                {globalError ? (
                  <View className="flex-row items-start gap-2.5 rounded-xl border border-[rgba(224,82,82,0.3)] bg-[rgba(224,82,82,0.1)] px-3.5 py-3 mb-4">
                    <Feather
                      name="alert-circle"
                      size={16}
                      color={colors.danger}
                    />
                    <Text className="flex-1 text-danger text-[13px]">
                      {globalError}
                    </Text>
                  </View>
                ) : null}

                <View className="mb-3">
                  <Text className="text-[11px] font-bold tracking-[1.1px] text-content-subtle mb-1.5">
                    ENLACE O CÓDIGO DE INVITACIÓN
                  </Text>
                  <View
                    className={cn(
                      "flex-row items-center gap-2 rounded-xl border bg-surface-input px-3.5 min-h-12",
                      fieldError ? "border-danger" : "border-line",
                    )}
                  >
                    <Feather
                      name="link-2"
                      size={15}
                      color={colors.textSubtle}
                    />
                    <TextInput
                      value={code}
                      onChangeText={(text) => {
                        setCode(text);
                        setFieldError("");
                        setGlobalError("");
                      }}
                      placeholder="ej: /invite/xY7z2Q"
                      placeholderTextColor={colors.textSubtle}
                      autoFocus
                      autoCapitalize="none"
                      className="flex-1 text-content text-[14px]"
                    />
                  </View>
                  {fieldError ? (
                    <View className="flex-row items-center gap-1.5 mt-1.5">
                      <Feather
                        name="alert-circle"
                        size={13}
                        color={colors.danger}
                      />
                      <Text className="text-danger text-[12px]">
                        {fieldError}
                      </Text>
                    </View>
                  ) : null}
                </View>

                <Text className="text-[12px] text-content-subtle leading-[17px]">
                  Los enlaces de invitación tienen este formato:{" "}
                  <Text className="text-content-muted">/invite/xY7z2Q</Text>
                </Text>

                <View className="flex-row gap-3 mt-6 pt-5 border-t border-t-line">
                  <Button
                    title="Cancelar"
                    variant="secondary"
                    onPress={onClose}
                    style={{ flex: 1, width: undefined }}
                  />
                  <Button
                    title="Unirme"
                    onPress={handleSubmit}
                    disabled={!code.trim()}
                    isLoading={isSubmitting}
                    iconRight="arrow-right"
                    style={{ flex: 1, width: undefined }}
                  />
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
