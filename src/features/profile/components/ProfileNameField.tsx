import { MAX_NAME } from "@discordia/client-shared";

import { useState } from "react";
import { Text, View } from "react-native";

import { InlineTextEditor } from "../../../components/ui/InlineTextEditor";
import { PremiumPill } from "../../billing/components/shared/PremiumPill";
import { EditFieldButton } from "./EditFieldButton";

interface ProfileNameFieldProps {
  name: string;
  isPremium: boolean;
  onSave: (name: string) => Promise<string | null>;
}

export function ProfileNameField({
  name,
  isPremium,
  onSave,
}: ProfileNameFieldProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <InlineTextEditor
        initialValue={name}
        maxLength={MAX_NAME}
        label="Nombre"
        hideLabel
        onSave={onSave}
        onClose={() => setIsEditing(false)}
      />
    );
  }

  return (
    <View className="flex-row items-center gap-1.5">
      <Text
        className="text-[18px] font-bold text-content shrink"
        numberOfLines={1}
      >
        {name}
      </Text>
      {isPremium ? <PremiumPill /> : null}
      <EditFieldButton
        label="Editar nombre"
        onPress={() => setIsEditing(true)}
      />
    </View>
  );
}
