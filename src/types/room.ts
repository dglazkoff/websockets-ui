import {User} from "./user";
import {SocketRequest, SocketResponse} from "./api";

export interface Room {
    index: number;
    players: User['name'][];
}

export interface CreateRoomRequest extends SocketRequest {
    type: 'create_room';
    data: "";
}

export interface AddUserToRoomRequest extends SocketRequest {
    type: 'add_user_to_room';
    data: {
        indexRoom: Room['index'];
    };
}

export interface UpdateRoomResponse extends SocketResponse {
    type: 'update_room';
    data: {
        roomId: Room['index'];
        roomUsers: Pick<User, 'name' | 'index'>[]
    }[];
}