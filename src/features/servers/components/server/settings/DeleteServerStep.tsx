import { ScrollView } from "react-native";

import type { DeleteServerConfirm } from "../../../useDeleteServerConfirm";
import { DeleteServerFields } from "../DeleteServerModal";

interface DeleteServerStepProps {
  deletion: DeleteServerConfirm;
  serverName: string;
  onCancel: () => void;
}

export function DeleteServerStep({
  deletion,
  serverName,
  onCancel,
}: DeleteServerStepProps) {
  return (
    <ScrollView
      contentContainerClassName="px-7 pt-7 pb-7 items-center"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <DeleteServerFields
        serverName={serverName}
        typedName={deletion.typedName}
        onTypedNameChange={deletion.setTypedName}
        error={deletion.error}
        canSubmit={deletion.canSubmit}
        isSubmitting={deletion.isSubmitting}
        onCancel={onCancel}
        onConfirm={deletion.confirm}
        buttonsLayout="row"
      />
    </ScrollView>
  );
}
