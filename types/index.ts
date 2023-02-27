export interface IPusher {
    [x:string] : any
}

export interface Size {
    width: number,
    height: number
}
export interface Error {
    type?: string,
    description: string,
    className?: string,
}
export interface PlayerType {
    id: string,
    name: string,
    is_host: boolean,
    lives: number,
    guesses: string[],
    status: string,
    ready: boolean,
    keywords: Keyword,
    [x: string]: any
}

export interface Lobby {
    host?: boolean,
    client_id?: string,
    code?: string,
}

export interface ILobby {
    lobby: Lobby,
    loading: boolean,
    name: string,
    mode: string,
    ready: boolean,
    winSize: Size,
    guesses: string[],
    status: string,
    lives: number,
    keywords: Keyword,
    create: boolean,
    onChanges: (player: PlayerType[]) => void,
    onError: (err: Error) => void,
}

export interface PostGame {
    description?: string,
    winner?: PlayerType
}
export interface Keyword {
    whole: string,
    split: string[]
}

export interface ButtonProps {
    title: string,
    className?: string,
    disabled?: boolean,
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}