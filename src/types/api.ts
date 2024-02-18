import {RegisterRequest} from "./user";
import {AddUserToRoomRequest, CreateRoomRequest} from "./room";

export type RequestType = 'reg' | 'create_room' | 'add_user_to_room';

export interface SocketRequest {
    type: RequestType;
    data: unknown;
}

export type SocketMessage = RegisterRequest | CreateRoomRequest | AddUserToRoomRequest;

export type ResponseType = 'reg' | 'update_winners' | 'update_room' | 'create_game';

export interface SocketResponse {
    type: ResponseType;
    data: unknown;
}