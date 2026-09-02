export interface Player {
  id: string;
  name: string;
  avatar: string;
}

export interface Room {
  id: string;
  code: string;
  players: Player[];
}
