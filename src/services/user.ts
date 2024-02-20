import {RegisterRequest, RegisterResponse, UpdateWinners, User, Winner} from "../types/user";
import {users} from "../db/users";
import {games} from "../db/games";
import {finishGame} from "./game";
import {rooms} from "../db/rooms";

export function getUserByName(name: string) {
    const user = [...users.values()].find(user => user.name === name);

    if(!user) {
        throw new Error('User not found');
    }

    return user;
}

export function isUserWithSameName(name: string) {
    let isUserWithSameName: boolean;

    try {
        getUserByName(name);
        isUserWithSameName = true;
    } catch {
        isUserWithSameName = false;
    }

    return isUserWithSameName;
}

export function registerUser(data: RegisterRequest['data'], index: number): RegisterResponse {
    const { name, password } = data;

    if(isUserWithSameName(name)) {
        const user = getUserByName(name)!;

        if (user.password !== password) {
            return { type: 'reg', data: { name, error: true, errorText: 'User already exists' } };
        }

        if (user.index !== index) {
            return { type: 'reg', data: { name, index: user.index, error: false, errorText: '' } };
        }
    }

    users.set(index, { index, name, password, wins: 0 });

    return { type: 'reg', data: { name, index, error: false, errorText: '' } };
}

export function getUserByIndex(index: number) {
    const user = users.get(index);

    if(!user) {
        throw new Error('User not found');
    }

    return user;
}

function getWinners(): Winner[] {
    return [...users.values()].map(({ name, wins }: User) => ({ name, wins }));
}

export function updateWinners(): UpdateWinners {
    return { type: 'update_winners', data: getWinners() };
}

export function userDisconnect(index: number) {
    users.delete(index);
    const userInGame = [...games.values()].find(game => game.players.indexOf(index) !== -1);
    const userInRoom = [...rooms.values()].find((room) => room.players.indexOf(index) !== -1);

    if (userInGame || userInRoom) {
        const [player1, player2] = userInGame?.players ?? userInRoom!.players;
        const opponentPlayer = index === player1 ? player2! : player1!;

        return [{
            id: opponentPlayer,
            responses: [finishGame(opponentPlayer), updateWinners()]
        }]
    }

    return;
}