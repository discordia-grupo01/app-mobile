import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

import type { CreateServerIconInput } from "./types";

type ImageValidator = (file: {
  mimeType: string;
  sizeBytes: number;
}) => string | undefined;

type PickServerImageResult =
  | { kind: "picked"; image: CreateServerIconInput }
  | { kind: "invalid"; error: string }
  | { kind: "cancelled" };

export async function pickServerImage({
  validate,
  purpose,
  fallbackName,
}: {
  validate: ImageValidator;
  purpose: string;
  fallbackName: string;
}): Promise<PickServerImageResult> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert(
      "Permiso necesario",
      `Necesitamos acceso a tus imágenes para elegir ${purpose}.`,
    );
    return { kind: "cancelled" };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.8,
  });
  const asset = result.canceled ? undefined : result.assets?.[0];
  if (!asset) return { kind: "cancelled" };

  const raw = asset.mimeType ?? "image/jpeg";
  const type = raw === "image/jpg" ? "image/jpeg" : raw;
  const error = validate({ mimeType: type, sizeBytes: asset.fileSize ?? 0 });
  if (error) return { kind: "invalid", error };

  return {
    kind: "picked",
    image: {
      uri: asset.uri,
      name: asset.fileName ?? asset.uri.split("/").pop() ?? fallbackName,
      type,
    },
  };
}
