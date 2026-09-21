import {
  MAX_NAME,
  type ServerSummary,
  validateServerIcon,
  validateServerName,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Alert,
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
import { createServer } from "../../api";
import { Button } from "../../../../components/ui/Button";
import { ServerAvatar } from "../ServerAvatar";

interface PickedIcon {
  uri: string;
  name: string;
  type: string;
}

interface CreateServerModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated: (server: ServerSummary) => void;
}

export function CreateServerModal({
  visible,
  onClose,
  onCreated,
}: CreateServerModalProps) {
  const colors = useThemeColors();
  const [step, setStep] = useState<"form" | "success">("form");
  const [created, setCreated] = useState<ServerSummary | null>(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<PickedIcon | null>(null);
  const [nameError, setNameError] = useState("");
  const [iconError, setIconError] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wasVisible, setWasVisible] = useState(visible);

  // Reinicia el formulario cada vez que el modal pasa a visible. Esto va en
  // el cuerpo del render (patron "adjust state when a prop changes" de
  // React) en vez de en un useEffect para cumplir con la regla de lint
  // react-hooks/set-state-in-effect.
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setStep("form");
      setCreated(null);
      setName("");
      setIcon(null);
      setNameError("");
      setIconError("");
      setGlobalError("");
      setIsSubmitting(false);
    }
  }

  const nameLength = name.length;
  const canSubmit =
    name.trim().length >= 2 && nameLength <= MAX_NAME && !isSubmitting;

  async function pickIcon() {
    setIconError("");
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permiso necesario",
        "Necesitamos acceso a tus imágenes para elegir un ícono.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    // `image/jpg` no es un MIME real, pero expo-image-picker lo devuelve en
    // algunos dispositivos. Antes la lista local de esta pantalla lo aceptaba
    // como caso aparte; ahora se normaliza aca, que es donde aparece la
    // rareza. El backend ni lo ve: sniffea los bytes con DetectContentType.
    const raw = asset.mimeType ?? "image/jpeg";
    const type = raw === "image/jpg" ? "image/jpeg" : raw;
    const iconError = validateServerIcon({
      mimeType: type,
      sizeBytes: asset.fileSize ?? 0,
    });
    if (iconError) {
      setIconError(iconError);
      return;
    }

    setIcon({
      uri: asset.uri,
      name: asset.fileName ?? asset.uri.split("/").pop() ?? "icon.jpg",
      type,
    });
  }

  function removeIcon() {
    setIcon(null);
    setIconError("");
  }

  async function handleSubmit() {
    setNameError("");
    setGlobalError("");

    const trimmed = name.trim();
    const nameError = validateServerName(trimmed);
    if (nameError) {
      setNameError(nameError);
      return;
    }

    setIsSubmitting(true);
    const result = await createServer({
      name: trimmed,
      icon: icon ? { uri: icon.uri, name: icon.name, type: icon.type } : null,
    });
    setIsSubmitting(false);

    if (!result.ok) {
      if (result.fieldErrors?.name) setNameError(result.fieldErrors.name);
      if (result.fieldErrors?.icon) setIconError(result.fieldErrors.icon);
      if (!result.fieldErrors) setGlobalError(result.message);
      return;
    }

    setCreated(result.server);
    setStep("success");
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

        <View className="w-full max-w-115 max-h-[90%] rounded-[20px] border border-line-strong bg-surface-modal overflow-hidden">
          <TouchableOpacity
            onPress={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-2xl items-center justify-center bg-surface-input border border-line"
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
          >
            <Feather name="x" size={14} color={colors.textSubtle} />
          </TouchableOpacity>

          <ScrollView
            contentContainerClassName="p-7 pt-8"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {step === "success" && created ? (
              <View className="items-center gap-6">
                <View className="w-full rounded-2xl border border-line-strong bg-surface-raised overflow-hidden">
                  <View className="flex-row items-center gap-2.5 px-4 py-3 border-b border-b-line">
                    <ServerAvatar
                      name={created.name}
                      uri={icon?.uri}
                      size={36}
                      borderRadius={18}
                    />
                    <Text
                      className="flex-1 text-[14px] font-bold text-content"
                      numberOfLines={1}
                    >
                      {created.name}
                    </Text>
                  </View>
                  <View className="px-3 py-2.5 gap-1">
                    {created.channels.map((channel) => (
                      <View
                        key={channel.id}
                        className="flex-row items-center gap-2 rounded-lg bg-surface-input px-2 py-[7px]"
                      >
                        <Feather
                          name={channel.kind === "text" ? "hash" : "volume-2"}
                          size={15}
                          color={colors.textSubtle}
                        />
                        <Text className="text-[13px] text-content-muted">
                          {channel.name}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View className="items-center gap-1.5">
                  <View className="w-12 h-12 rounded-2xl items-center justify-center bg-[rgba(56,161,105,0.15)] mb-1">
                    <Feather name="check" size={26} color={colors.success} />
                  </View>
                  <Text className="text-[16px] font-bold text-content">
                    ¡Servidor creado!
                  </Text>
                  <Text className="text-[13px] leading-[19px] text-content-muted text-center max-w-65">
                    <Text className="text-content font-bold">
                      {created.name}
                    </Text>{" "}
                    ya está listo. Encontrás tus canales en la barra lateral.
                  </Text>
                </View>

                <Button
                  title="Ir al servidor"
                  onPress={() => onCreated(created)}
                />
              </View>
            ) : (
              <View>
                <View className="items-center mb-5">
                  <Text className="text-[20px] font-bold text-content mb-1">
                    Crear un servidor
                  </Text>
                  <Text className="text-[13px] leading-[19px] text-content-muted text-center">
                    Personalizá tu servidor con un nombre e ícono.{"\n"}Siempre
                    podés cambiarlo después.
                  </Text>
                </View>

                {globalError ? (
                  <View className="flex-row items-start gap-2.5 rounded-xl border border-[rgba(224,82,82,0.3)] bg-[rgba(224,82,82,0.1)] px-3.5 py-3 mb-5">
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

                <View className="items-center gap-2.5 mb-6">
                  <TouchableOpacity activeOpacity={0.85} onPress={pickIcon}>
                    <ServerAvatar name={name} uri={icon?.uri} size={96} />
                  </TouchableOpacity>

                  <View className="flex-row items-center gap-2.5">
                    <TouchableOpacity
                      className="flex-row items-center gap-1.5 rounded-lg border border-line bg-surface-input px-3 py-[7px]"
                      onPress={pickIcon}
                    >
                      <Feather
                        name="edit-2"
                        size={11}
                        color={colors.textMuted}
                      />
                      <Text className="text-[12px] font-semibold text-content-muted">
                        {icon ? "Cambiar imagen" : "Subir imagen"}
                      </Text>
                    </TouchableOpacity>
                    {icon ? (
                      <TouchableOpacity onPress={removeIcon}>
                        <Text className="text-[12px] font-semibold text-danger">
                          Quitar
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  {iconError ? (
                    <View className="flex-row items-center gap-1.5 mt-1.5">
                      <Feather
                        name="alert-circle"
                        size={13}
                        color={colors.danger}
                      />
                      <Text className="text-danger text-[12px]">
                        {iconError}
                      </Text>
                    </View>
                  ) : null}

                  <Text className="text-[11px] text-content-subtle text-center">
                    PNG, JPG o WEBP · Máx. 20 MB
                  </Text>
                </View>

                <View className="mb-1">
                  <View className="flex-row items-center justify-between mb-1.5">
                    <Text className="text-[11px] font-bold tracking-[1.1px] text-content-subtle">
                      NOMBRE DEL SERVIDOR{" "}
                      <Text style={{ color: colors.danger }}>*</Text>
                    </Text>
                    <Text
                      className="text-[11px] text-content-subtle"
                      style={
                        nameLength > MAX_NAME ? { color: colors.danger } : null
                      }
                    >
                      {nameLength}/{MAX_NAME}
                    </Text>
                  </View>
                  <View
                    className={cn(
                      "rounded-xl border bg-surface-input px-3.5 min-h-12 justify-center",
                      nameError ? "border-danger" : "border-line",
                    )}
                  >
                    <TextInput
                      value={name}
                      onChangeText={(text) => {
                        setName(text);
                        setNameError("");
                        setGlobalError("");
                      }}
                      placeholder="Mi servidor épico"
                      placeholderTextColor={colors.textSubtle}
                      maxLength={110}
                      autoFocus
                      className="text-content text-[14px]"
                    />
                  </View>
                  {nameError ? (
                    <View className="flex-row items-center gap-1.5 mt-1.5">
                      <Feather
                        name="alert-circle"
                        size={13}
                        color={colors.danger}
                      />
                      <Text className="text-danger text-[12px]">
                        {nameError}
                      </Text>
                    </View>
                  ) : null}
                </View>

                <View className="flex-row gap-3 mt-6 pt-5 border-t border-t-line">
                  <Button
                    title="Cancelar"
                    variant="secondary"
                    onPress={onClose}
                    style={{ flex: 1, width: undefined }}
                  />
                  <Button
                    title="Crear servidor"
                    onPress={handleSubmit}
                    disabled={!canSubmit}
                    isLoading={isSubmitting}
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
