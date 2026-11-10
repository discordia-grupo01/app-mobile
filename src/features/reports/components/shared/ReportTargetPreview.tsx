import {
  type Message,
  type MessageAuthor,
  messageAttachmentsCount,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { Avatar } from "../../../../components/ui/Avatar";
import { useThemeColors } from "../../../../theme/theme-context";
import { MessageContent } from "../../../messages/components/MessageContent";
import { MessageHeader } from "../../../messages/components/MessageHeader";

type ReportTargetPreviewProps =
  | { kind: "message"; message: Message; author: MessageAuthor }
  | { kind: "user"; name: string; avatarUri: string | null };

/** El mensaje o el usuario reportado. Lo usan el modal y la lista de reportes. */
export function ReportTargetPreview(props: ReportTargetPreviewProps) {
  const colors = useThemeColors();

  if (props.kind === "user") {
    return (
      <View className="flex-row items-center gap-3 rounded-xl border border-line bg-surface-input p-3">
        <Avatar name={props.name} uri={props.avatarUri} size={32} />
        <Text
          className="min-w-0 flex-1 text-[14px] font-bold text-content"
          numberOfLines={1}
        >
          {props.name}
        </Text>
      </View>
    );
  }

  const { message, author } = props;
  const attachments = message.attachments?.length ?? 0;
  return (
    <View className="flex-row gap-3 rounded-xl border border-line bg-surface-input px-3 py-2.5">
      <Avatar name={author.name} uri={author.avatarUrl} size={32} />
      <View className="min-w-0 flex-1">
        <MessageHeader author={author} createdAt={message.inserted_at} />
        {message.content ? (
          <View className="max-h-[63px] overflow-hidden">
            <MessageContent content={message.content} mentions={message} />
          </View>
        ) : null}
        {attachments > 0 ? (
          <View className="mt-1 flex-row items-center gap-1">
            <Feather name="paperclip" size={12} color={colors.textSubtle} />
            <Text className="text-[12px] text-content-subtle">
              {messageAttachmentsCount(attachments)}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
