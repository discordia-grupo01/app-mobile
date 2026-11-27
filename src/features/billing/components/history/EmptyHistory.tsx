import {
  EMPTY_STATE_ICON_SIZE,
  EmptyState,
} from "../../../../components/ui/EmptyState";
import { DiscordiaPointIcon } from "../shared/DiscordiaIcons";

export function EmptyHistory({ text }: { text: string }) {
  return (
    <EmptyState
      media={<DiscordiaPointIcon size={EMPTY_STATE_ICON_SIZE} />}
      text={text}
    />
  );
}
