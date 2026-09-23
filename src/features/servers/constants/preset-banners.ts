import { type PresetBanner } from "@discordia/client-shared";
import * as FileSystem from "expo-file-system/legacy";

import type { CreateServerIconInput } from "../types";

export async function materializePresetBanner(
  preset: PresetBanner,
): Promise<CreateServerIconInput> {
  const dir = `${FileSystem.cacheDirectory}preset-banners/`;
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true }).catch(
    () => {},
  );
  const uri = `${dir}${preset.id}-${Date.now()}.png`;
  await FileSystem.writeAsStringAsync(uri, preset.base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return { uri, name: `${preset.id}.png`, type: "image/png" };
}
