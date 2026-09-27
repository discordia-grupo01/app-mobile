import {
  RECOVERY_CODES_LOW_THRESHOLD,
  twoFactorRecoveryCodesRemaining,
  type TwoFactorStatus,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { Button } from "../../../../../components/ui/Button";
import { cn } from "../../../../../lib/cn";
import { useThemeColors } from "../../../../../theme/theme-context";
import { TwoFactorErrorBanner } from "./TwoFactorErrorBanner";

interface TwoFactorStatusStepProps {
  status: TwoFactorStatus | null;
  formError: string | null;
  isSubmitting: boolean;
  onActivate: () => void;
  onRegenerate: () => void;
  onDisable: () => void;
  onClose: () => void;
}

export function TwoFactorStatusStep({
  status,
  formError,
  isSubmitting,
  onActivate,
  onRegenerate,
  onDisable,
  onClose,
}: TwoFactorStatusStepProps) {
  const colors = useThemeColors();
  const enabled = status?.enabled ?? false;

  return (
    <>
      <View
        className={cn(
          "mb-4 flex-row items-center gap-4 rounded-2xl border p-4",
          "border-line bg-surface-raised",
        )}
      >
        <View
          className={cn(
            "size-14 items-center justify-center rounded-2xl",
            enabled ? "bg-success/15" : "bg-surface-input",
          )}
        >
          <Feather
            name={enabled ? "check-circle" : "key"}
            size={26}
            color={enabled ? colors.success : colors.textSubtle}
          />
        </View>
        <View className="flex-1">
          <View className="mb-1 flex-row flex-wrap items-center gap-2">
            <Text className="text-[15px] font-bold text-content">
              {enabled ? "Protección activada" : "Protección desactivada"}
            </Text>
            <View
              className={cn(
                "rounded-full px-2 py-0.5",
                enabled ? "bg-success/15" : "bg-surface-input",
              )}
            >
              <Text
                className={cn(
                  "text-[10px] font-bold uppercase",
                  enabled ? "text-success" : "text-content-subtle",
                )}
              >
                {enabled ? "Activa" : "Inactiva"}
              </Text>
            </View>
          </View>
          <Text className="text-[13px] leading-[18px] text-content-muted">
            {enabled
              ? "Tu contraseña y un código protegen el acceso a tu cuenta."
              : "Sumá una segunda barrera de seguridad con una app autenticadora."}
          </Text>
          {enabled ? (
            <Text
              className={cn(
                "mt-1 text-[12px]",
                (status?.recovery_codes_remaining ?? 0) <=
                  RECOVERY_CODES_LOW_THRESHOLD
                  ? "text-highlight"
                  : "text-content-muted",
              )}
            >
              {twoFactorRecoveryCodesRemaining(
                status?.recovery_codes_remaining ?? 0,
              )}
            </Text>
          ) : null}
        </View>
      </View>

      {formError ? <TwoFactorErrorBanner message={formError} /> : null}

      {enabled ? (
        <View className="gap-3">
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={onRegenerate}
            className="flex-row items-start gap-3 rounded-xl border border-line bg-surface-input p-4"
          >
            <Feather name="download" size={19} color={colors.info} />
            <View className="flex-1">
              <Text className="text-[14px] font-bold text-content">
                Nuevos códigos
              </Text>
              <Text className="text-[12px] text-content-subtle">
                Reemplaza la lista anterior
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={onDisable}
            className="flex-row items-start gap-3 rounded-xl border border-danger/20 bg-danger/6 p-4"
          >
            <Feather name="lock" size={19} color={colors.danger} />
            <View className="flex-1">
              <Text className="text-[14px] font-bold text-danger">
                Desactivar 2FA
              </Text>
              <Text className="text-[12px] text-content-subtle">
                Volver a usar solo contraseña
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      ) : (
        <Button title="Activar" onPress={onActivate} isLoading={isSubmitting} />
      )}

      <TouchableOpacity
        activeOpacity={0.75}
        className="mt-2.5 items-center py-3"
        onPress={onClose}
      >
        <Text className="text-[13px] font-bold text-content-muted">Cerrar</Text>
      </TouchableOpacity>
    </>
  );
}
