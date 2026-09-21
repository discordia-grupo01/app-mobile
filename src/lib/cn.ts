/**
 * Une clases de NativeWind salteando las condiciones falsas:
 * `cn("p-4", isActive && "bg-accent")`.
 *
 * No resuelve conflictos: si dos clases tocan la misma propiedad
 * (`border-line` y `border-accent`) gana la que esta despues en el CSS, no en
 * el string. Para variantes, elegir una sola con un ternario.
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
