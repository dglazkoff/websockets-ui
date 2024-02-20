import {SocketRequest, SocketResponse} from "./api";
import {User} from "./user";

export interface TilePosition {
    x: number;
    y: number;
}

export type TurnStatus = 'miss' | 'killed' | 'shot';

export interface Ship {
    position: TilePosition,
    direction: boolean,
    length: number,
    type: "small" | "medium" | "large" | "huge",
}

export interface GameShip extends Ship {
    hp: number
}

export interface Game {
    gameId: number;
    players: User['index'][];
    playersTurn: User['index'] | null;
    ships: Record<User['index'], GameShip[]>;
}

export interface CreateGame extends SocketResponse {
    type: 'create_game';
    data: {
        idGame: Game['gameId'];
        idPlayer: User['index'];
    };
}

export interface StartGame extends SocketResponse {
    type: 'start_game';
    data: {
        currentPlayerIndex: User['index'];
        ships: Ship[];
    };
}

export interface Turn extends SocketResponse {
    type: 'turn';
    data: {
        currentPlayer: User['index'];
        gameId?: Game['gameId'];
    };
}

export interface AddShipRequest extends SocketRequest {
    type: 'add_ships';
    data: {
        gameId: Game['gameId'];
        ships: Ship[];
        indexPlayer: User['index'];
    };
}

export interface AttackRequest extends SocketRequest {
    type: 'attack';
    data: TilePosition & {
        gameId: Game['gameId'];
        indexPlayer: User['index'];
    };
}

export interface SinglePlay extends SocketRequest {
    type: 'single_play';
    data: "";
}

export interface AttackRandomRequest extends SocketRequest {
    type: 'randomAttack';
    data: {
        gameId: Game['gameId'];
        indexPlayer: User['index'];
    };
}

export interface AttackResponse extends SocketResponse {
    type: 'attack';
    data: {
        position: TilePosition;
        currentPlayer: User['index'];
        status: TurnStatus;
    };
}

export interface Finish extends SocketResponse {
    type: 'finish';
    data: {
        winPlayer: User['index'];
    };
}