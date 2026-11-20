import { Text } from "react-native";

/** Titulo de un grupo de opciones en los menus de configuracion. */
export function MenuGroupLabel({ children }: { children: string }) {
  return (
    <Text className="mb-2.5 mt-3 px-1 text-[14px] font-semibold text-content-muted">
      {children}
    </Text>
  );
}
