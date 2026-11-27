import { Text } from "react-native";

import { cn } from "../../lib/cn";

interface CharacterCounterProps {
  length: number;
  max: number;
  className?: string;
}

export function CharacterCounter({
  length,
  max,
  className,
}: CharacterCounterProps) {
  const tooLong = length > max;
  const nearLimit = length >= max - 10;

  return (
    <Text
      className={cn(
        "text-xs tabular-nums",
        tooLong
          ? "text-danger"
          : nearLimit
            ? "text-highlight"
            : "text-content-subtle",
        className,
      )}
    >
      {length}/{max}
    </Text>
  );
}
