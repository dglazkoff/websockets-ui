import {SocketRequest, SocketResponse} from "./api";

export interface User {
    index: number;
    name: string;
    password: string;
    wins: number;
}

export interface Winner {
    name: User['name'];
    wins: number;
}

export interface RegisterRequest extends SocketRequest {
    type: 'reg',
    data: {
        name: string;
        password: string;
    }
}

export interface RegisterResponse extends SocketResponse {
    type: 'reg',
    // в каких случаях ошибки при регистрации??
    data: {
        name: string;
        index?: number;
        error: boolean;
        errorText?: string;
    }
}

export interface UpdateWinners extends SocketResponse {
    type: 'update_winners',
    data: Winner[]
}