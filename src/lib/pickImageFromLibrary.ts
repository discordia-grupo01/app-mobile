import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

const PICKER_QUALITY = 1;

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
    // Con `quality` menor a 1, en Android expo-image-picker vuelve a codificar
    // la imagen con un solo cuadro: un GIF llega quieto (y como PNG). Con 1
    // copia el archivo tal cual. El tamaño se valida igual sobre el original.
    quality: PICKER_QUALITY,
  });
  const asset = result.canceled ? undefined : result.assets?.[0];
  if (!asset) return null;

  // expo-image-picker devuelve `image/jpg` en algunos dispositivos, que no es
  // un MIME real.
  const raw = asset.mimeType ?? "image/jpeg";
  return { asset, mimeType: raw === "image/jpg" ? "image/jpeg" : raw };
}
