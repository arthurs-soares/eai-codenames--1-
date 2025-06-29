export enum CardType {
  RED = 'RED',
  BLUE = 'BLUE',
  BYSTANDER = 'BYSTANDER',
  ASSASSIN = 'ASSASSIN',
}

export enum Player {
  RED = 'RED',
  BLUE = 'BLUE',
}

export interface PlayerInfo {
  id: string;
  name: string;
}

export interface Team {
  players: PlayerInfo[];
  spymasterId: string | null;
}

export type GamePhase = 'TEAM_SELECTION' | 'IN_PROGRESS' | 'GAME_OVER';


export interface CardData {
  word: string;
  type: CardType;
  revealed: boolean;
}

export interface GameState {
  // Common state
  gamePhase: GamePhase;
  redTeam: Team;
  blueTeam: Team;
  unassignedPlayers: PlayerInfo[];
  message: string;
  turnTimerDuration: number | null;
  themes?: string;
  customWords?: string[];
  
  // In-progress / Game Over state
  cards?: CardData[];
  currentTurn?: Player;
  scores?: { [Player.RED]: number; [Player.BLUE]: number };
  winner?: Player | null;
  isGameOver?: boolean;
  startingTeam?: Player;
  turnEndTime?: number | null; // Timestamp for when the turn ends
}