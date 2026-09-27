import { Image } from "react-native";

import { useTheme } from "../../theme/theme-context";

const LOGO_FOR_DARK_THEME = require("../../../assets/logo-light.png");
const LOGO_FOR_LIGHT_THEME = require("../../../assets/logo.png");

export function AuthLogo() {
  const { theme } = useTheme();

  return (
    <Image
      source={theme === "light" ? LOGO_FOR_LIGHT_THEME : LOGO_FOR_DARK_THEME}
      className="h-[52px] w-[200px]"
      resizeMode="contain"
    />
  );
}
