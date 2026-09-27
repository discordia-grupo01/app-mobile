/**
 * NativeWind no resuelve de forma confiable los modificadores de opacidad
 * (`bg-danger/12`, `border-info/30`, ...) sobre colores del tema: son
 * variables CSS inyectadas en runtime por `ThemeProvider`, y el fondo
 * termina sin aplicarse. Para "cartelitos" (alerts, badges) usamos este
 * helper con `style` en vez de la clase de Tailwind.
 */
export function withAlpha(hexColor: string, alpha: number): string {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
