import { Song } from "./Song";
import { User } from "./User";

export interface Favorite {
  id: number;
  user: User;
  song: Song;
}