import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { Button } from "../../../../../components/ui/Button";
import { withAlpha } from "../../../../../lib/color";
import { useThemeColors } from "../../../../../theme/theme-context";

interface TwoFactorCodesStepProps {
  recoveryCodes: string[];
  copied: boolean;
  onCopy: () => void;
  onDone: () => void;
}

export function TwoFactorCodesStep({
  recoveryCodes,
  copied,
  onCopy,
  onDone,
}: TwoFactorCodesStepProps) {
  const colors = useThemeColors();
  const [saved, setSaved] = useState(false);

  function handleCopy() {
    onCopy();
    setSaved(true);
  }

  return (
    <>
      <View className="mb-3 items-center">
        <View
          className="mb-3 size-14 items-center justify-center rounded-2xl"
          style={{ backgroundColor: withAlpha(colors.success, 0.15) }}
        >
          <Feather name="check-circle" size={26} color={colors.success} />
        </View>
        <Text className="text-center text-[17px] font-bold text-content">
          Guardá tus códigos de recuperación
        </Text>
        <Text className="mt-1 text-center text-[13px] leading-[18px] text-content-muted">
          Cada código sirve una sola vez. Esta es la única vez que mostraremos
          esta lista.
        </Text>
      </View>

      <View className="mb-4 flex-row flex-wrap gap-2 rounded-2xl border border-line bg-surface-raised p-4">
        {recoveryCodes.map((recoveryCode, index) => (
          <View
            key={recoveryCode}
            className="w-[47%] items-center rounded-lg bg-surface-input px-2 py-2"
          >
            <Text selectable className="text-center text-[13px] text-content">
              <Text className="text-content-subtle">{index + 1}. </Text>
              {recoveryCode}
            </Text>
          </View>
        ))}
      </View>

      <Button
        title={copied ? "Copiados" : "Copiar códigos"}
        variant="secondary"
        onPress={handleCopy}
        iconRight={copied ? "check" : "copy"}
        className="mb-2.5"
      />
      <TouchableOpacity
        activeOpacity={0.75}
        className="items-center py-3"
        onPress={() => (saved ? onDone() : setSaved(true))}
      >
        <Text
          className={
            saved
              ? "text-[13px] font-bold text-info"
              : "text-[13px] font-bold text-content-muted"
          }
        >
          {saved ? "Listo, cerrar" : "Ya los guardé"}
        </Text>
      </TouchableOpacity>
    </>
  );
}
