import {CreateGame} from "../types/game";
import {getRoom} from "./room";
import {getUserByName} from "./user";

export function createGame(indexRoom: number): [CreateGame,CreateGame] {
    const id = Date.now();
    const room = getRoom(indexRoom);

    if (room.players.length !== 2) throw new Error('Room is not full');

    return [
        { type: 'create_game', data: { idGame: id, idPlayer: getUserByName(room.players[0]!).index } },
        { type: 'create_game', data: { idGame: id, idPlayer: getUserByName(room.players[1]!).index } },
    ]
}