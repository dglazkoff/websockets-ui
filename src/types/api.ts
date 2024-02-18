import {RegisterRequest} from "./user";
import {AddUserToRoomRequest, CreateRoomRequest} from "./room";
import {AddShipRequest, AttackRandomRequest, AttackRequest} from "./game";

export type RequestType = 'reg' | 'create_room' | 'add_user_to_room' | 'add_ships' | 'attack' | 'randomAttack';

export interface SocketRequest {
    type: RequestType;
    data: unknown;
}

export type SocketMessage = RegisterRequest | CreateRoomRequest | AddUserToRoomRequest | AddShipRequest | AttackRequest | AttackRandomRequest;

export type ResponseType = 'reg' | 'update_winners' | 'update_room' | 'create_game' | 'start_game' | 'attack' | 'turn' | 'finish';

export interface SocketResponse {
    type: ResponseType;
    data: unknown;
}