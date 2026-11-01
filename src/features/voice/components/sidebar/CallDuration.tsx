import {
  formatCallDuration,
  VOICE_CALL_DURATION_LABEL,
} from "@discordia/client-shared";

import { Text } from "react-native";

import { cn } from "../../../../lib/cn";
import { useNow } from "../../useNow";

export function CallDuration({
  startedAt,
  className,
}: {
  startedAt: number;
  className?: string;
}) {
  const duration = formatCallDuration(useNow() - startedAt);

  return (
    <Text
      accessibilityLabel={`${VOICE_CALL_DURATION_LABEL}: ${duration}`}
      className={cn("tabular-nums", className)}
    >
      {duration}
    </Text>
  );
}
