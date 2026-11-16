import type { User } from "@discordia/client-shared";

export function sameUser(current: User | null, next: User): boolean {
  return current !== null && JSON.stringify(current) === JSON.stringify(next);
}
