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

/**
 * `PATCH /v1/servers/:serverId`. Los tres campos son independientes en el
 * backend (ver `UpdateServerFieldErrors` en `@discordia/client-shared`):
 * mandar `name` no toca `icon` ni `banner`, y viceversa. `banner` y
 * `removeBanner` son mutuamente excluyentes -- si se manda un banner nuevo,
 * no tiene sentido pedir removerlo en la misma request, así que quien arma
 * los params elige uno de los dos, no los dos.
 */
export interface UpdateServerParams {
  serverId: string;
  name?: string;
  icon?: CreateServerIconInput | null;
  banner?: CreateServerIconInput | null;
  removeBanner?: boolean;
}
