import {RegisterRequest, RegisterResponse, UpdateWinners, User, Winner} from "../types/user";
import {users} from "../db/users";

export function getUserByName(name: string) {
    const user = users.get(name);

    if(!user) {
        throw new Error('User not found');
    }

    return user;

}

export function registerUser(data: RegisterRequest['data'], index: number): RegisterResponse {
    const { name, password } = data;

    if(users.has(name) && getUserByName(name)?.password !== password) {
        return { type: 'reg', data: { name, error: true, errorText: 'User already exists' } };
    }

    users.set(name, { index, name, password, wins: 0 });

    return { type: 'reg', data: { name, index, error: false, errorText: '' } };
}

export function getUserByIndex(index: number) {
    const user = [...users.values()].find(user => user.index === index);
    console.log(user);
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