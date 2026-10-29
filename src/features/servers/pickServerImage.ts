import { pickImageFromLibrary } from "../../lib/pickImageFromLibrary";
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
  const picked = await pickImageFromLibrary(`elegir ${purpose}`);
  if (!picked) return { kind: "cancelled" };

  const { asset, mimeType } = picked;
  const error = validate({ mimeType, sizeBytes: asset.fileSize ?? 0 });
  if (error) return { kind: "invalid", error };

  return {
    kind: "picked",
    image: {
      uri: asset.uri,
      name: asset.fileName ?? asset.uri.split("/").pop() ?? fallbackName,
      type: mimeType,
    },
  };
}
