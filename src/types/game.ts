import {SocketResponse} from "./api";
import {User} from "./user";

export interface TilePosition {
    x: number;
    y: number;
}

export interface Ship {
    position: TilePosition,
    direction: boolean,
    length: number,
    type: "small" | "medium" | "large" | "huge",
}

export interface Game {
    gameId: number;
    players: User['name'][];
    shipsPositions: Record<User['name'], Ship[]>;
}

export interface CreateGame extends SocketResponse {
    type: 'create_game';
    data: {
        idGame: number;
        idPlayer: User['index'];
    };
}