/**
 * Lo unico propio de esta app: como `expo-image-picker` entrega el icono.
 * Las entidades y los resultados salen de `@discordia/client-shared`.
 */
export interface CreateServerIconInput {
  uri: string;
  name: string;
  type: string;
}

export interface CreateServerParams {
  name: string;
  icon?: CreateServerIconInput | null;
}
