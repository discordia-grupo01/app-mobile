import { useState } from "react";
import { Text, View } from "react-native";

import { FieldLabel } from "../../../components/ui/FieldLabel";
import { InlineTextEditor } from "../../../components/ui/InlineTextEditor";
import { EditFieldButton } from "./EditFieldButton";

interface EditableTextSectionProps {
  label: string;
  value: string;
  emptyText: string;
  editLabel: string;
  maxLength: number;
  placeholder?: string;
  multiline?: boolean;
  onSave: (draft: string) => Promise<string | null>;
  onStartEditing?: () => void;
}

export function EditableTextSection({
  label,
  value,
  emptyText,
  editLabel,
  maxLength,
  placeholder,
  multiline,
  onSave,
  onStartEditing,
}: EditableTextSectionProps) {
  const [isEditing, setIsEditing] = useState(false);

  function startEditing() {
    setIsEditing(true);
    onStartEditing?.();
  }

  if (isEditing) {
    return (
      <InlineTextEditor
        initialValue={value}
        maxLength={maxLength}
        label={label}
        placeholder={placeholder}
        multiline={multiline}
        onSave={onSave}
        onClose={() => setIsEditing(false)}
      />
    );
  }

  return (
    <View>
      <View className="flex-row items-center gap-1.5 min-h-7 mb-1.5">
        <FieldLabel>{label}</FieldLabel>
        <EditFieldButton label={editLabel} onPress={startEditing} />
      </View>
      <Text className="text-[13px] leading-[19px] text-content-muted">
        {value || emptyText}
      </Text>
    </View>
  );
}
