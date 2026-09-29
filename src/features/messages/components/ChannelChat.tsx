import {
  ADD_REACTION_LABEL,
  type Channel,
  type MessageAuthor,
} from "@discordia/client-shared";

import { useState } from "react";

import { useChannelMessages } from "../use-channel-messages";
import { EmojiPickerSheet } from "./EmojiPickerSheet";
import { MessageComposer } from "./MessageComposer";
import { MessageList } from "./MessageList";

interface ChannelChatProps {
  channel: Channel;
  currentAuthor: MessageAuthor | null;
}

export function ChannelChat({ channel, currentAuthor }: ChannelChatProps) {
  const { messages, authors, sendMessage, toggleReaction } = useChannelMessages(
    channel,
    currentAuthor,
  );
  const [reactingToId, setReactingToId] = useState<string | null>(null);

  return (
    <>
      <MessageList
        channelName={channel.name}
        messages={messages}
        authors={authors}
        onToggleReaction={toggleReaction}
        onRequestReaction={setReactingToId}
      />
      <MessageComposer
        channelName={channel.name}
        onSend={sendMessage}
        disabled={!currentAuthor}
      />
      <EmojiPickerSheet
        visible={reactingToId !== null}
        title={ADD_REACTION_LABEL}
        onPick={(emoji) => {
          if (reactingToId) toggleReaction(reactingToId, emoji);
        }}
        onClose={() => setReactingToId(null)}
      />
    </>
  );
}
