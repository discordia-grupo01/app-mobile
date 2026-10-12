import {
  ADD_BANNER_LABEL,
  BANNER_PRESETS_LABEL,
  CHANGE_BANNER_LABEL,
  CHANGE_SERVER_ICON_LABEL,
  MAX_NAME,
  PRESET_BANNER_FAILED,
  PRESET_BANNERS,
  type PresetBanner,
  REMOVE_BANNER_LABEL,
  SERVER_NAME_LABEL,
  SERVER_NAME_PLACEHOLDER,
  type DeleteServerResult,
  type ServerSummary,
  matchesServerNameForDeletion,
  validateServerBanner,
  validateServerIcon,
  validateServerName,
  WORD_FILTER_TITLE,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { type ComponentProps, useEffect, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { cn } from "../../../../lib/cn";
import { useThemeColors } from "../../../../theme/theme-context";
import { Button } from "../../../../components/ui/Button";
import {
  resolveServerBannerUrl,
  resolveServerIconUrl,
  updateServer,
} from "../../api";
import { materializePresetBanner } from "../../constants/preset-banners";
import type { CreateServerIconInput } from "../../types";
import { Avatar } from "../../../../components/ui/Avatar";
import { ServerBanner } from "../ServerBanner";
import { ModalShell } from "../../../../components/ui/ModalShell";
import { DeleteServerFields } from "./DeleteServerModal";
import { WordFilterStep } from "./WordFilterStep";

const BANNER_HEIGHT = 120;
const ICON_SIZE = 84;
const ICON_RING = 4;
const ICON_BOX = ICON_SIZE + ICON_RING * 2;
const PRESET_SWATCH_HEIGHT = 64;
const PRESET_SWATCH_RADIUS = 16;
const PRESET_COLUMNS = 3;

type SettingsStep = "list" | "profile" | "words" | "delete";
type FeatherIconName = ComponentProps<typeof Feather>["name"];

function chunk<T>(items: readonly T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

function PresetGradientFill({
  preset,
  idPrefix,
}: {
  preset: PresetBanner;
  idPrefix: string;
}) {
  const gradientId = `${idPrefix}-${preset.id}`;
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          {preset.colors.map((color, index) => (
            <Stop
              key={color}
              offset={preset.locations[index]}
              stopColor={color}
            />
          ))}
        </LinearGradient>
      </Defs>
      <Rect
        x={0}
        y={0}
        width="100%"
        height="100%"
        fill={`url(#${gradientId})`}
      />
    </Svg>
  );
}

function PresetSwatch({
  preset,
  isSelected,
  onPress,
}: {
  preset: PresetBanner;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="flex-1"
      accessibilityRole="button"
      accessibilityLabel={`Fondo ${preset.label}`}
      accessibilityState={{ selected: isSelected }}
    >
      <View
        style={{
          height: PRESET_SWATCH_HEIGHT,
          borderRadius: PRESET_SWATCH_RADIUS,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <View
          className={cn(
            "flex-1 overflow-hidden border-2",
            isSelected ? "border-white" : "border-transparent",
          )}
          style={{ borderRadius: PRESET_SWATCH_RADIUS }}
        >
          <PresetGradientFill preset={preset} idPrefix="swatch" />
          {isSelected ? (
            <View className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full items-center justify-center bg-[rgba(0,0,0,0.55)] border border-[rgba(255,255,255,0.5)]">
              <Feather name="check" size={11} color="#ffffff" />
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function SettingsHeader({
  step,
  onBack,
  onClose,
}: {
  step: SettingsStep;
  onBack: () => void;
  onClose: () => void;
}) {
  const colors = useThemeColors();
  const title =
    step === "list"
      ? "Configuración del servidor"
      : step === "profile"
        ? "Perfil del servidor"
        : step === "words"
          ? WORD_FILTER_TITLE
          : "Eliminar servidor";

  return (
    <View className="flex-row items-center gap-2 px-3 py-3 border-b border-b-line">
      {step !== "list" ? (
        <TouchableOpacity
          onPress={onBack}
          className="w-8 h-8 rounded-2xl items-center justify-center"
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <Feather name="chevron-left" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      ) : (
        <View className="w-8 h-8 rounded-2xl items-center justify-center">
          <Feather name="settings" size={16} color={colors.text} />
        </View>
      )}
      <Text
        className="flex-1 text-center text-[15px] font-bold text-content"
        numberOfLines={1}
      >
        {title}
      </Text>
      <TouchableOpacity
        onPress={onClose}
        className="w-8 h-8 rounded-2xl items-center justify-center"
        accessibilityRole="button"
        accessibilityLabel="Cerrar"
      >
        <Feather name="x" size={16} color={colors.textSubtle} />
      </TouchableOpacity>
    </View>
  );
}

function SettingsRow({
  icon,
  title,
  subtitle,
  danger,
  onPress,
}: {
  icon: FeatherIconName;
  title: string;
  subtitle: string;
  danger?: boolean;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="flex-row items-center gap-3 px-7 py-3.5"
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View
        className={cn(
          "w-9 h-9 rounded-xl items-center justify-center",
          danger ? "bg-[rgba(224,82,82,0.14)]" : "bg-surface-raised",
        )}
      >
        <Feather
          name={icon}
          size={16}
          color={danger ? colors.danger : colors.text}
        />
      </View>
      <View className="flex-1">
        <Text
          className={cn(
            "text-[14px] font-semibold",
            danger ? "text-danger" : "text-content",
          )}
        >
          {title}
        </Text>
        <Text className="text-[12px] text-content-subtle mt-0.5">
          {subtitle}
        </Text>
      </View>
      <Feather name="chevron-right" size={16} color={colors.textSubtle} />
    </TouchableOpacity>
  );
}

function SettingsIdentityHeader({ server }: { server: ServerSummary }) {
  return (
    <View className="items-center pt-6 pb-4">
      <Avatar
        name={server.name}
        uri={resolveServerIconUrl(server.icon_url)}
        size={56}
        borderRadius={16}
      />
      <Text
        className="text-[14px] font-bold text-content mt-2.5"
        numberOfLines={1}
      >
        {server.name}
      </Text>
    </View>
  );
}

function SettingsListStep({
  server,
  isOwner,
  canManageServer,
  canManageMessages,
  onSelectProfile,
  onSelectWords,
  onSelectDelete,
}: {
  server: ServerSummary;
  isOwner: boolean;
  canManageServer: boolean;
  canManageMessages: boolean;
  onSelectProfile: () => void;
  onSelectWords: () => void;
  onSelectDelete: () => void;
}) {
  return (
    <View className="pb-2">
      <SettingsIdentityHeader server={server} />
      <View className="h-px bg-line mx-7 mb-2" />

      {canManageServer ? (
        <SettingsRow
          icon="edit-2"
          title="Perfil del servidor"
          subtitle="Banner, ícono y nombre"
          onPress={onSelectProfile}
        />
      ) : null}
      {canManageMessages ? (
        <SettingsRow
          icon="slash"
          title={WORD_FILTER_TITLE}
          subtitle="Mensajes que no se pueden enviar"
          onPress={onSelectWords}
        />
      ) : null}
      {isOwner ? (
        <>
          <View className="h-px bg-line mx-7 my-2" />
          <SettingsRow
            icon="trash-2"
            title="Eliminar servidor"
            subtitle="Esta acción no se puede deshacer"
            danger
            onPress={onSelectDelete}
          />
        </>
      ) : null}
    </View>
  );
}

interface ServerSettingsModalProps {
  visible: boolean;
  server: ServerSummary;
  isOwner: boolean;
  /** "Perfil del servidor" (nombre, icono, banner). */
  canManageServer: boolean;
  /** "Palabras prohibidas". */
  canManageMessages: boolean;
  onClose: () => void;
  onUpdated: (server: ServerSummary) => void;
  onConfirmDelete: (confirmName: string) => Promise<DeleteServerResult>;
}

export function ServerSettingsModal({
  visible,
  server,
  isOwner,
  canManageServer,
  canManageMessages,
  onClose,
  onUpdated,
  onConfirmDelete,
}: ServerSettingsModalProps) {
  const colors = useThemeColors();
  const [step, setStep] = useState<SettingsStep>("list");
  const [name, setName] = useState(server.name);
  const [icon, setIcon] = useState<CreateServerIconInput | null>(null);
  const [banner, setBanner] = useState<CreateServerIconInput | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [removeBanner, setRemoveBanner] = useState(false);
  const [nameError, setNameError] = useState("");
  const [iconError, setIconError] = useState("");
  const [bannerError, setBannerError] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreparingBanner, setIsPreparingBanner] = useState(false);
  const presetRequestIdRef = useRef(0);
  const [wasVisible, setWasVisible] = useState(visible);
  const [wasServerId, setWasServerId] = useState(server.id);

  const [deleteTypedName, setDeleteTypedName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  if (visible !== wasVisible || server.id !== wasServerId) {
    setWasVisible(visible);
    setWasServerId(server.id);
    if (visible) {
      setStep("list");
      setName(server.name);
      setIcon(null);
      setBanner(null);
      setSelectedPresetId(null);
      setRemoveBanner(false);
      setNameError("");
      setIconError("");
      setBannerError("");
      setGlobalError("");
      setIsSubmitting(false);
      setIsPreparingBanner(false);
      setDeleteTypedName("");
      setIsDeleting(false);
      setDeleteError("");
    }
  }

  useEffect(() => {
    if (visible) {
      presetRequestIdRef.current += 1;
    }
  }, [visible, server.id]);

  const nameLength = name.length;
  const trimmedName = name.trim();
  const nameChanged = trimmedName !== server.name;
  const hasChanges =
    nameChanged || icon !== null || banner !== null || removeBanner;
  const canSubmit =
    trimmedName.length >= 2 &&
    nameLength <= MAX_NAME &&
    hasChanges &&
    !isSubmitting &&
    !isPreparingBanner;

  const previewIconUri = icon?.uri ?? resolveServerIconUrl(server.icon_url);
  const previewBannerUri = removeBanner
    ? null
    : (banner?.uri ?? resolveServerBannerUrl(server.banner_url));
  const selectedPresetBanner = selectedPresetId
    ? (PRESET_BANNERS.find((preset) => preset.id === selectedPresetId) ?? null)
    : null;

  const canSubmitDelete =
    matchesServerNameForDeletion(server.name, deleteTypedName) && !isDeleting;

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
    const raw = asset.mimeType ?? "image/jpeg";
    const type = raw === "image/jpg" ? "image/jpeg" : raw;
    const error = validateServerIcon({
      mimeType: type,
      sizeBytes: asset.fileSize ?? 0,
    });
    if (error) {
      setIconError(error);
      return;
    }

    setIcon({
      uri: asset.uri,
      name: asset.fileName ?? asset.uri.split("/").pop() ?? "icon.jpg",
      type,
    });
  }

  async function pickBanner() {
    setBannerError("");
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permiso necesario",
        "Necesitamos acceso a tus imágenes para elegir un banner.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const raw = asset.mimeType ?? "image/jpeg";
    const type = raw === "image/jpg" ? "image/jpeg" : raw;
    const error = validateServerBanner({
      mimeType: type,
      sizeBytes: asset.fileSize ?? 0,
    });
    if (error) {
      setBannerError(error);
      return;
    }

    presetRequestIdRef.current += 1;
    setIsPreparingBanner(false);
    setBanner({
      uri: asset.uri,
      name: asset.fileName ?? asset.uri.split("/").pop() ?? "banner.jpg",
      type,
    });
    setSelectedPresetId(null);
    setRemoveBanner(false);
  }

  async function handlePickPreset(preset: PresetBanner) {
    setBannerError("");
    setSelectedPresetId(preset.id);
    setRemoveBanner(false);
    setIsPreparingBanner(true);
    const requestId = ++presetRequestIdRef.current;
    try {
      const file = await materializePresetBanner(preset);
      if (presetRequestIdRef.current !== requestId) return; // superado por un tap más nuevo
      setBanner(file);
    } catch (err) {
      if (presetRequestIdRef.current !== requestId) return;
      if (__DEV__) {
        console.warn("No se pudo preparar el fondo elegido", err);
      }
      setBannerError(PRESET_BANNER_FAILED);
    } finally {
      if (presetRequestIdRef.current === requestId) setIsPreparingBanner(false);
    }
  }

  function handleRemoveBanner() {
    presetRequestIdRef.current += 1;
    setIsPreparingBanner(false);
    setBanner(null);
    setSelectedPresetId(null);
    setBannerError("");
    setRemoveBanner(true);
  }

  async function handleSubmit() {
    setNameError("");
    setGlobalError("");

    const nameValidationError = validateServerName(trimmedName);
    if (nameValidationError) {
      setNameError(nameValidationError);
      return;
    }

    setIsSubmitting(true);
    const result = await updateServer({
      serverId: server.id,
      name: nameChanged ? trimmedName : undefined,
      icon: icon
        ? { uri: icon.uri, name: icon.name, type: icon.type }
        : undefined,
      banner: banner
        ? { uri: banner.uri, name: banner.name, type: banner.type }
        : undefined,
      removeBanner,
    });
    setIsSubmitting(false);

    if (!result.ok) {
      if (result.fieldErrors?.name) setNameError(result.fieldErrors.name);
      if (result.fieldErrors?.icon) setIconError(result.fieldErrors.icon);
      if (result.fieldErrors?.banner) setBannerError(result.fieldErrors.banner);
      if (!result.fieldErrors) setGlobalError(result.message);
      return;
    }

    onUpdated(result.server);
  }

  async function handleConfirmDelete() {
    if (!canSubmitDelete) return;

    setDeleteError("");
    setIsDeleting(true);
    const result = await onConfirmDelete(deleteTypedName.trim());
    setIsDeleting(false);

    if (!result.ok) {
      setDeleteError(result.fieldErrors?.confirm_name ?? result.message);
      return;
    }

    onClose();
  }

  return (
    <ModalShell visible={visible} onClose={onClose} className="max-w-115">
      <SettingsHeader
        step={step}
        onBack={() => setStep("list")}
        onClose={onClose}
      />

      {step === "list" ? (
        <SettingsListStep
          server={server}
          isOwner={isOwner}
          canManageServer={canManageServer}
          canManageMessages={canManageMessages}
          onSelectProfile={() => setStep("profile")}
          onSelectWords={() => setStep("words")}
          onSelectDelete={() => setStep("delete")}
        />
      ) : null}

      {step === "profile" ? (
        <ScrollView
          contentContainerClassName="pb-7"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="px-7 pt-6 mb-1">
            <Text className="text-[13px] leading-[19px] text-content-muted">
              Tocá el banner o el ícono para cambiarlos.
            </Text>
          </View>

          {globalError ? (
            <View className="flex-row items-start gap-2.5 mx-7 rounded-xl border border-[rgba(224,82,82,0.3)] bg-[rgba(224,82,82,0.1)] px-3.5 py-3 mt-4">
              <Feather name="alert-circle" size={16} color={colors.danger} />
              <Text className="flex-1 text-danger text-[13px]">
                {globalError}
              </Text>
            </View>
          ) : null}

          <View
            className="mx-7 mt-6"
            style={{ height: BANNER_HEIGHT + ICON_BOX / 2 }}
          >
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={pickBanner}
              className="w-full rounded-2xl bg-surface-raised overflow-hidden border border-line-strong"
              style={{ height: BANNER_HEIGHT }}
              accessibilityRole="button"
              accessibilityLabel={CHANGE_BANNER_LABEL}
            >
              {selectedPresetBanner ? (
                <PresetGradientFill
                  preset={selectedPresetBanner}
                  idPrefix="preview"
                />
              ) : previewBannerUri ? (
                <ServerBanner uri={previewBannerUri} height={BANNER_HEIGHT} />
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

            {previewBannerUri ? (
              <TouchableOpacity
                onPress={handleRemoveBanner}
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
                onPress={pickIcon}
                className="bg-surface-modal rounded-full items-center justify-center"
                style={{ width: ICON_BOX, height: ICON_BOX }}
                accessibilityRole="button"
                accessibilityLabel={CHANGE_SERVER_ICON_LABEL}
              >
                <Avatar
                  name={name || server.name}
                  uri={previewIconUri}
                  size={ICON_SIZE}
                />
              </TouchableOpacity>
              <View
                pointerEvents="none"
                className="absolute right-0 bottom-0 w-6 h-6 rounded-xl items-center justify-center bg-[rgba(0,0,0,0.65)] border-2 border-surface-modal"
              >
                <Feather name="camera" size={11} color="#ffffff" />
              </View>
            </View>
          </View>

          {iconError || bannerError ? (
            <View className="mx-7 mt-2 gap-1">
              {iconError ? (
                <View className="flex-row items-center gap-1.5">
                  <Feather
                    name="alert-circle"
                    size={13}
                    color={colors.danger}
                  />
                  <Text className="text-danger text-[12px]">{iconError}</Text>
                </View>
              ) : null}
              {bannerError ? (
                <View className="flex-row items-center gap-1.5">
                  <Feather
                    name="alert-circle"
                    size={13}
                    color={colors.danger}
                  />
                  <Text className="text-danger text-[12px]">{bannerError}</Text>
                </View>
              ) : null}
            </View>
          ) : null}

          <View className="px-7 mt-5">
            <Text className="text-[11px] font-bold tracking-[1.1px] text-content-subtle mb-2 uppercase">
              {BANNER_PRESETS_LABEL}
            </Text>
            <View className="gap-2.5">
              {chunk(PRESET_BANNERS, PRESET_COLUMNS).map((row, index) => (
                <View key={index} className="flex-row gap-2.5">
                  {row.map((preset) => (
                    <PresetSwatch
                      key={preset.id}
                      preset={preset}
                      isSelected={selectedPresetId === preset.id}
                      onPress={() => handlePickPreset(preset)}
                    />
                  ))}
                </View>
              ))}
            </View>
          </View>

          <View className="px-7 mt-7">
            <View className="flex-row items-center justify-between mb-1.5">
              <Text className="text-[11px] font-bold tracking-[1.1px] text-content-subtle uppercase">
                {SERVER_NAME_LABEL}{" "}
                <Text style={{ color: colors.danger }}>*</Text>
              </Text>
              <Text
                className="text-[11px] text-content-subtle"
                style={nameLength > MAX_NAME ? { color: colors.danger } : null}
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
                placeholder={SERVER_NAME_PLACEHOLDER}
                placeholderTextColor={colors.textSubtle}
                maxLength={110}
                className="text-content text-[14px]"
              />
            </View>
            {nameError ? (
              <View className="flex-row items-center gap-1.5 mt-1.5">
                <Feather name="alert-circle" size={13} color={colors.danger} />
                <Text className="text-danger text-[12px]">{nameError}</Text>
              </View>
            ) : null}
          </View>

          <View className="flex-row gap-3 px-7 mt-7 pt-5 border-t border-t-line">
            <Button
              title="Cancelar"
              variant="secondary"
              onPress={onClose}
              style={{ flex: 1, width: undefined }}
            />
            <Button
              title="Guardar cambios"
              onPress={handleSubmit}
              disabled={!canSubmit}
              isLoading={isSubmitting}
              style={{ flex: 1, width: undefined }}
            />
          </View>
        </ScrollView>
      ) : null}

      {step === "words" ? <WordFilterStep serverId={server.id} /> : null}

      {step === "delete" ? (
        <ScrollView
          contentContainerClassName="px-7 pt-7 pb-7 items-center"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <DeleteServerFields
            serverName={server.name}
            typedName={deleteTypedName}
            onTypedNameChange={setDeleteTypedName}
            error={deleteError}
            canSubmit={canSubmitDelete}
            isSubmitting={isDeleting}
            onCancel={() => setStep("list")}
            onConfirm={handleConfirmDelete}
            buttonsLayout="row"
          />
        </ScrollView>
      ) : null}
    </ModalShell>
  );
}
