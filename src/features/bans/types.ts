/** A quien se va a banear, con lo necesario para mostrarlo en la confirmacion. */
export interface BanTarget {
  userId: string;
  name: string;
  avatarUri: string | null;
}

export type BansTab = "bans" | "members";
