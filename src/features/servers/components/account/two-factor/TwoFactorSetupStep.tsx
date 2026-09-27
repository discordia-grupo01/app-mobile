import {
  normalizeTotpCode,
  TOTP_CODE_LENGTH,
  TWO_FACTOR_SCAN_INSTRUCTIONS,
  type TwoFactorCodeErrors,
  type TwoFactorSetup,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

import { Button } from "../../../../../components/ui/Button";
import { TextField } from "../../../../../components/ui/TextField";
import { useThemeColors } from "../../../../../theme/theme-context";
import { TwoFactorErrorBanner } from "./TwoFactorErrorBanner";

interface TwoFactorSetupStepProps {
  setup: TwoFactorSetup;
  code: string;
  codeErrors: TwoFactorCodeErrors;
  formError: string | null;
  isSubmitting: boolean;
  onCodeChange: (code: string) => void;
  onActivate: () => void;
  onCancel: () => void;
}

export function TwoFactorSetupStep({
  setup,
  code,
  codeErrors,
  formError,
  isSubmitting,
  onCodeChange,
  onActivate,
  onCancel,
}: TwoFactorSetupStepProps) {
  const colors = useThemeColors();
  const [secretCopied, setSecretCopied] = useState(false);

  async function copySecret() {
    await Clipboard.setStringAsync(setup.secret);
    setSecretCopied(true);
  }

  return (
    <>
      <Text className="mb-1.5 text-[17px] font-bold text-content">
        Escaneá el código
      </Text>
      <Text className="mb-4 text-[13px] leading-[18px] text-content-muted">
        {TWO_FACTOR_SCAN_INSTRUCTIONS}
      </Text>

      <View className="mb-4 items-center">
        <View className="rounded-xl bg-white p-4">
          <QRCode value={setup.otpauth_url} size={180} />
        </View>
      </View>

      <View className="mb-1.5 flex-row items-center gap-2">
        <Feather name="smartphone" size={16} color={colors.info} />
        <Text className="text-[13px] font-semibold text-info">
          ¿No podés escanear?
        </Text>
      </View>
      <Text className="mb-2 text-[12px] text-content-subtle">
        Ingresá esta clave manualmente. Si cerrás y volvés, seguirá siendo la
        misma.
      </Text>
      <View className="mb-4 flex-row items-center justify-between gap-3 rounded-xl border border-line bg-surface-input px-3 py-3">
        <Text selectable className="flex-1 text-[13px] text-content">
          {setup.secret}
        </Text>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={copySecret}
          accessibilityLabel="Copiar clave"
        >
          <Feather
            name={secretCopied ? "check" : "copy"}
            size={16}
            color={colors.info}
          />
        </TouchableOpacity>
      </View>

      <TextField
        label="CÓDIGO DE TU APP"
        placeholder="123456"
        keyboardType="number-pad"
        maxLength={TOTP_CODE_LENGTH}
        iconName="key"
        value={code}
        onChangeText={(text) => onCodeChange(normalizeTotpCode(text))}
        error={codeErrors.code}
      />

      {formError ? <TwoFactorErrorBanner message={formError} /> : null}

      <Button title="Activar" onPress={onActivate} isLoading={isSubmitting} />

      <TouchableOpacity
        activeOpacity={0.75}
        className="mt-2.5 items-center py-3"
        onPress={onCancel}
      >
        <Text className="text-[13px] font-bold text-content-muted">
          Cancelar
        </Text>
      </TouchableOpacity>
    </>
  );
}
