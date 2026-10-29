import {
  MAX_NAME,
  MIN_SERVER_NAME,
  PRESET_BANNER_FAILED,
  PRESET_BANNERS,
  type PresetBanner,
  type ServerSummary,
  validateServerBanner,
  validateServerIcon,
  validateServerName,
} from "@discordia/client-shared";
import { useRef, useState } from "react";

import {
  resolveServerBannerUrl,
  resolveServerIconUrl,
  updateServer,
} from "./api";
import { materializePresetBanner } from "./constants/preset-banners";
import { pickServerImage } from "./pickServerImage";
import type { CreateServerIconInput } from "./types";

interface UseServerSettingsFormArgs {
  server: ServerSummary;
  onUpdated: (server: ServerSummary) => void;
}

export type ServerSettingsForm = ReturnType<typeof useServerSettingsForm>;

export function useServerSettingsForm({
  server,
  onUpdated,
}: UseServerSettingsFormArgs) {
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
  // Materializar un fondo fijo es asíncrono: si el usuario toca otro fondo,
  // sube una imagen o quita el banner antes de que termine, el resultado
  // viejo se descarta.
  const presetRequestIdRef = useRef(0);

  const trimmedName = name.trim();
  const nameChanged = trimmedName !== server.name;
  const hasChanges =
    nameChanged || icon !== null || banner !== null || removeBanner;
  const canSubmit =
    trimmedName.length >= MIN_SERVER_NAME &&
    name.length <= MAX_NAME &&
    hasChanges &&
    !isSubmitting &&
    !isPreparingBanner;

  const iconPreviewUri = icon?.uri ?? resolveServerIconUrl(server.icon_url);
  const bannerPreviewUri = removeBanner
    ? null
    : (banner?.uri ?? resolveServerBannerUrl(server.banner_url));
  const selectedPreset = selectedPresetId
    ? (PRESET_BANNERS.find((preset) => preset.id === selectedPresetId) ?? null)
    : null;

  function changeName(value: string) {
    setName(value);
    setNameError("");
    setGlobalError("");
  }

  async function pickIcon() {
    setIconError("");
    const result = await pickServerImage({
      validate: validateServerIcon,
      purpose: "un ícono",
      fallbackName: "icon.jpg",
    });
    if (result.kind === "invalid") setIconError(result.error);
    if (result.kind === "picked") setIcon(result.image);
  }

  async function pickBanner() {
    setBannerError("");
    const result = await pickServerImage({
      validate: validateServerBanner,
      purpose: "un banner",
      fallbackName: "banner.jpg",
    });
    if (result.kind === "invalid") setBannerError(result.error);
    if (result.kind !== "picked") return;

    presetRequestIdRef.current += 1;
    setIsPreparingBanner(false);
    setBanner(result.image);
    setSelectedPresetId(null);
    setRemoveBanner(false);
  }

  async function choosePreset(preset: PresetBanner) {
    setBannerError("");
    setSelectedPresetId(preset.id);
    setRemoveBanner(false);
    setIsPreparingBanner(true);
    const requestId = ++presetRequestIdRef.current;
    try {
      const file = await materializePresetBanner(preset);
      if (presetRequestIdRef.current !== requestId) return;
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

  function clearBanner() {
    presetRequestIdRef.current += 1;
    setIsPreparingBanner(false);
    setBanner(null);
    setSelectedPresetId(null);
    setBannerError("");
    setRemoveBanner(true);
  }

  async function submit() {
    setNameError("");
    setGlobalError("");

    const validationError = validateServerName(trimmedName);
    if (validationError) {
      setNameError(validationError);
      return;
    }

    setIsSubmitting(true);
    const result = await updateServer({
      serverId: server.id,
      name: nameChanged ? trimmedName : undefined,
      icon: icon ?? undefined,
      banner: banner ?? undefined,
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

  return {
    name,
    changeName,
    nameError,
    iconError,
    bannerError,
    globalError,
    isSubmitting,
    canSubmit,
    iconPreviewUri,
    bannerPreviewUri,
    selectedPreset,
    pickIcon,
    pickBanner,
    choosePreset,
    clearBanner,
    submit,
  };
}
