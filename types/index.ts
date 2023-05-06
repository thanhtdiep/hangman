export interface IPusher {
  [x: string]: any;
}

export interface Size {
  width: number;
  height: number;
}
export interface Error {
  type?: string;
  description: string;
  className?: string;
}
export interface PlayerType {
  id: string;
  name: string;
  is_host: boolean;
  lives: number;
  guesses: string[];
  status: string;
  ready: boolean;
  keywords: Keyword;
  [x: string]: any;
}

export interface Lobby {
  host?: boolean;
  client_id?: string;
  code?: string;
  status?: string;
  players?: PlayerType[];
}

export interface ILobby {
  lobby: Lobby;
  name: string;
  mode: string;
  ready: boolean;
  guesses: string[];
  lives: number;
  keyword: Keyword;
  onChanges: (player: PlayerType[]) => void;
}

export interface PostGame {
  description?: string;
  winner?: PlayerType;
}
// Keyword
export interface Keyword {
  whole: string;
  split: string[];
}

export interface IKeyword {
  keyword?: Keyword | null;
  guesses: string[];
  trigger?: boolean;
  hint?: boolean;
  disabled?: boolean;
  onNewKeyword?: (keyword: Keyword) => void;
}

// Button
export interface ButtonProps {
  title: string;
  className?: string;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

// Alphabet
export interface IAlphabet {
  guesses: string[];
  visible: boolean;
  loading: boolean;
  onClick: (guess: string, guesses: string[]) => void;
}

// MAN
export interface ManProps {
  lives: number;
  className?: string;
  small?: boolean;
}

// Player
export interface Player {
  id: string;
  name: string;
  lives: number;
  is_host?: boolean;
  ready?: boolean;
  status?: string;
  guesses: string[];
}
export interface PlayerProps {
  player: Player;
  mode: string;
  self: boolean;
  className?: string;
}

// Result
export interface ResultProps {
  win: boolean;
  lives: number;
  status?: string;
}

// Multiplayer Page
export interface MultiplayerPageProps {
  name: string;
  code: string;
  host: boolean;
}
