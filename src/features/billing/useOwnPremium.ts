import { useAuth } from "../auth/auth-context";

export function useOwnPremium(): boolean {
  return useAuth().user?.premium ?? false;
}
