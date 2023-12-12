export interface Song {
  id: number;
  title: string;
  artist: string;
  genre?: string;
  audio: ArrayBuffer;
}