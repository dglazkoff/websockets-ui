import {rooms} from "../db/rooms";
import {Room, UpdateRoomResponse} from "../types/room";
import {getUserByName} from "./user";

export const createRoom = () => {
    const id = Date.now();
    rooms.set(id, { index: id, players: [] });

    return id;
}

export const getRoom = (indexRoom: number) => {
    const roomData = rooms.get(indexRoom);

    if (!roomData) throw new Error('Room not found');

    return roomData;
}

export const addUserToRoom = (indexRoom: number, userName: string) => {
    const roomData = getRoom(indexRoom);

    rooms.set(indexRoom, { ...roomData, players: [...roomData.players, userName] });
}

export const updateRooms = (): UpdateRoomResponse => {
    return {
        type: 'update_room',
        data: [...rooms.values()].map((room: Room) => ({
            roomId: room.index,
            roomUsers: room.players.map(userName => {
                const user = getUserByName(userName);
                return { name: user.name, index: user.index };
            })
        })).filter(room => room.roomUsers.length === 1)
    };
}

export const removeRoom = (indexRoom: number) => {
    rooms.delete(indexRoom)
}