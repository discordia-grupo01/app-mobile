import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export interface PickedLibraryImage {
  asset: ImagePicker.ImagePickerAsset;
  mimeType: string;
}

export async function pickImageFromLibrary(
  permissionReason: string,
): Promise<PickedLibraryImage | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert(
      "Permiso necesario",
      `Necesitamos acceso a tus imágenes para ${permissionReason}.`,
    );
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.8,
  });
  const asset = result.canceled ? undefined : result.assets?.[0];
  if (!asset) return null;

  // expo-image-picker devuelve `image/jpg` en algunos dispositivos, que no es
  // un MIME real.
  const raw = asset.mimeType ?? "image/jpeg";
  return { asset, mimeType: raw === "image/jpg" ? "image/jpeg" : raw };
}
