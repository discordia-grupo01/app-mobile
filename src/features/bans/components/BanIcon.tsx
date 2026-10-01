import { MaterialCommunityIcons } from "@expo/vector-icons";

interface BanIconProps {
  size: number;
  color: string;
}

/** El martillo con el que web-client identifica las acciones de baneo. */
export function BanIcon({ size, color }: BanIconProps) {
  return <MaterialCommunityIcons name="gavel" size={size} color={color} />;
}
