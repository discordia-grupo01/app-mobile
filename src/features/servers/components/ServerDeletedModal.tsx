import { Feather } from "@expo/vector-icons";
import {
  SERVER_DELETED_NOTICE_ACTION,
  SERVER_DELETED_NOTICE_TITLE,
  serverDeletedNoticeDescription,
} from "@discordia/client-shared";
import { Text, View } from "react-native";

import { Button } from "../../../components/ui/Button";
import { ModalShell } from "../../../components/ui/ModalShell";
import { useThemeColors } from "../../../theme/theme-context";
import { useStaffNotices } from "../../notifications/useStaffNotices";

export function ServerDeletedModal() {
  const { notice, dismiss } = useStaffNotices();
  const colors = useThemeColors();

  const close = () => {
    if (notice) dismiss(notice.id);
  };

  return (
    <ModalShell
      visible={notice !== null}
      onClose={close}
      className="max-w-80 p-7 pt-8 items-center"
    >
      <View className="w-16 h-16 rounded-[18px] items-center justify-center bg-danger/15 mb-5">
        <Feather name="trash-2" size={26} color={colors.danger} />
      </View>
      <Text className="text-[19px] font-bold text-content text-center">
        {SERVER_DELETED_NOTICE_TITLE}
      </Text>
      <Text className="text-[14px] leading-5 text-content-muted text-center mt-2.5 mb-6.5">
        {notice ? serverDeletedNoticeDescription(notice.server_name) : ""}
      </Text>

      <View className="w-full">
        <Button title={SERVER_DELETED_NOTICE_ACTION} onPress={close} />
      </View>
    </ModalShell>
  );
}
