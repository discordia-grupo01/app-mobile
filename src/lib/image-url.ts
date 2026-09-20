import { env } from "./env";

/** Resolves backend-relative image paths and preserves public absolute URLs. */
export function resolveImageUri(
  imagePath: string | null | undefined,
): string | null {
  if (!imagePath) return null;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  return `${env.apiUrl}${imagePath}`;
}
