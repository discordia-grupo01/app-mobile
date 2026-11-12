import { type ReactNode, useState } from "react";
import { Text } from "react-native";

interface SpoilerProps {
  children: (concealed: boolean) => ReactNode;
}

/** Texto tapado hasta que se lo toca. Una vez revelado queda a la vista. */
export function Spoiler({ children }: SpoilerProps) {
  const [revealed, setRevealed] = useState(false);

  if (revealed) {
    return <Text className="rounded bg-surface-sunken">{children(false)}</Text>;
  }
  return (
    <Text
      accessibilityRole="button"
      accessibilityLabel="Spoiler, tocá para verlo"
      onPress={() => setRevealed(true)}
      className="rounded bg-content-subtle"
      style={{ color: "transparent" }}
    >
      {children(true)}
    </Text>
  );
}
