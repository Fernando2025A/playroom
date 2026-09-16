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
  isPublic: boolean;
  status: 'waiting' | 'playing';
}

export interface Game {
  id: string;
  roomCode: string;
  status: 'playing' | 'closed';
  turn: number;
  currentPlayerId: string;
  players: GamePlayer[];
  round: number;
  winnerId?: string;
}

export interface GamePlayer {
  playerId: string;
  position: number;
}