import { useState } from "react";
import { Image, type ImageStyle, type StyleProp } from "react-native";

interface ServerBannerProps {
  uri?: string | null;
  height: number;
  style?: StyleProp<ImageStyle>;
}

// El banner es un recurso público (ver servers/README.md y
// servers/openapi.yaml), así que -- igual que Avatar -- se le pasa la
// URL directo a <Image>, sin bajarla a mano ni cachearla a disco.
export function ServerBanner({ uri, height, style }: ServerBannerProps) {
  const [failed, setFailed] = useState(false);
  const [lastUri, setLastUri] = useState(uri);
  if (uri !== lastUri) {
    setLastUri(uri);
    setFailed(false);
  }

  if (!uri) return null;
  if (failed) return null;

  return (
    <Image
      source={{ uri }}
      onError={() => setFailed(true)}
      resizeMode="cover"
      className="bg-surface-raised"
      style={[{ width: "100%", height }, style]}
    />
  );
}
