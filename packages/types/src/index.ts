export interface Player {
  id: string;
  username: string;
  roomCode?: string;
  status: 'online' | 'offline' | 'in_game';
  avatarUrl?: string;
  createdAt: string;
}

export interface Room {
  name: string;
  ownerId: string;
  code: string;
  players: Player[];
  maxPlayers: number;
}
