import { useState } from "react";
import { Text, View } from "react-native";

import { Button } from "../../../../../components/ui/Button";

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
  const [saved, setSaved] = useState(false);

  function handleCopy() {
    onCopy();
    setSaved(true);
  }

  return (
    <>
      <Text className="mb-5 text-[14px] leading-5 text-content-muted">
        Cada código sirve una sola vez. Esta es la única vez que mostraremos
        esta lista.
      </Text>

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
      <Button
        title={saved ? "Listo, cerrar" : "Ya los guardé"}
        variant={saved ? "primary" : "secondary"}
        onPress={() => (saved ? onDone() : setSaved(true))}
      />
    </>
  );
}
