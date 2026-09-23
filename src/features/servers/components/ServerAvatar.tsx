import { getInitial } from "@discordia/client-shared";

import { useState } from "react";
import { Image, Text, View } from "react-native";

interface ServerAvatarProps {
  name: string;
  uri?: string | null;
  size?: number;
  borderRadius?: number;
}

export function ServerAvatar({
  name,
  uri,
  size = 48,
  borderRadius,
}: ServerAvatarProps) {
  const radius = borderRadius ?? size / 2;
  const [failed, setFailed] = useState(false);
  const [lastUri, setLastUri] = useState(uri);
  if (uri !== lastUri) {
    setLastUri(uri);
    setFailed(false);
  }

  if (uri && !failed) {
    return (
      <Image
        source={{ uri }}
        onError={() => setFailed(true)}
        className="bg-surface-raised"
        style={{ width: size, height: size, borderRadius: radius }}
      />
    );
  }

  const initial = getInitial(name) ?? "?";

  return (
    <View
      className="items-center justify-center bg-accent"
      style={{ width: size, height: size, borderRadius: radius }}
    >
      <Text className="text-white font-bold" style={{ fontSize: size * 0.42 }}>
        {initial}
      </Text>
    </View>
  );
}
