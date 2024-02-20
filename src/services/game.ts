import {
    AttackResponse,
    CreateGame,
    Finish,
    GameShip,
    Ship,
    StartGame,
    TilePosition,
    Turn,
    TurnStatus
} from "../types/game";
import {getRoom} from "./room";
import {games} from "../db/games";
import {users} from "../db/users";
import {getUserByIndex} from "./user";
import {getRandomArbitrary} from "../utils";
import {BOT_ID, botShips} from "../botConstants";

function isEmpty(value: unknown): value is null | undefined {
    return value === undefined || value === null;
}

export function getGame(gameId: number) {
    const game = games.get(gameId);

    if (!game) throw new Error('Game not found');

    return game;
}

export function createGame(indexRoom: number): [CreateGame,CreateGame] {
    const id = Date.now();
    const room = getRoom(indexRoom);

    if (room.players.length !== 2) throw new Error('Room is not full');

    games.set(id, { gameId: id, players: room.players, ships: {}, playersTurn: null });
    return [
        { type: 'create_game', data: { idGame: id, idPlayer: room.players[0]! } },
        { type: 'create_game', data: { idGame: id, idPlayer: room.players[1]! } },
    ]
}

export function addShips(gameId: number, ships: Ship[], indexPlayer: number) {
    const game = getGame(gameId);

    if (game.players.indexOf(indexPlayer) === -1) throw new Error('Player not found in game');

    games.set(gameId, { ...game, ships: { ...game.ships, [indexPlayer]: ships.map(ship => ({ ...ship, hp: ship.length })) } });
}

export function canStartGame(gameId: number): boolean {
    const game = getGame(gameId);

    return Object.keys(game.ships).length === 2 && Object.values(game.ships).every(ships => ships.length === 10);
}

export function getPlayerShips(gameId: number, indexPlayer: number): GameShip[] {
    const game = getGame(gameId);

    if (!game.ships[indexPlayer]) throw new Error('Ships not found');

    return game.ships[indexPlayer]!;
}

export function startGame(gameId: number): StartGame[] | undefined {
    const game = getGame(gameId);
    const [player1, player2] = game.players;

    if (!canStartGame(gameId)) {
        return;
    }

    return [
        { type: 'start_game', data: { currentPlayerIndex: player1!, ships: getPlayerShips(gameId, player1!) } },
        { type: 'start_game', data: { currentPlayerIndex: player2!, ships: getPlayerShips(gameId, player2!) } }
    ];
}

export const getPlayersTurn = (gameId: number) => getGame(gameId).playersTurn;

export function playersTurn(gameId: number, indexPlayer?: number, turnStatus?: TurnStatus): Turn {
    const game = getGame(gameId);
    const [player1, player2] = game.players;

    if (!turnStatus || isEmpty(indexPlayer)) {
        game.playersTurn = Math.round(getRandomArbitrary(0, 1)) ? player1! : player2!;
    } else {
        const opponentPlayer = indexPlayer === player1 ? player2! : player1!;

        game.playersTurn = turnStatus === 'miss' ? opponentPlayer : indexPlayer;
    }

    return { type: 'turn', data: { currentPlayer: game.playersTurn, gameId: game.playersTurn === BOT_ID ? gameId : undefined } };
}

export function isHitShip(ship: GameShip, position: TilePosition): boolean {
    if (ship.direction) {
        return ship.position.x === position.x && (ship.position.y <= position.y && position.y <= ship.position.y + (ship.length - 1));
    }

    return ship.position.y === position.y && (ship.position.x <= position.x && position.x <= ship.position.x + (ship.length - 1));
}

export function attack(gameId: number, indexPlayer: number, position: TilePosition): AttackResponse {
    const game = getGame(gameId);
    const [player1, player2] = game.players;
    const opponentPlayer = indexPlayer === player1 ? player2! : player1!;

    const opponentShips = getPlayerShips(gameId, opponentPlayer);

    const hitShip = opponentShips.find(ship => isHitShip(ship, position));

    if (hitShip) {
        hitShip.hp--;
    }

    const status = hitShip ? hitShip.hp > 0 ? 'shot' : 'killed' : 'miss';

    return {
        type: 'attack',
        data: {
            position: position,
            currentPlayer: indexPlayer,
            status,
        }
    };
}

export function isAllShipsKilled(gameId: number, indexPlayer: number): boolean {
    const game = getGame(gameId);
    const [player1, player2] = game.players;
    const opponentPlayer = indexPlayer === player1 ? player2! : player1!;

    const opponentShips = getPlayerShips(gameId, opponentPlayer);

    return opponentShips.every(ship => ship.hp === 0);
}

export function finishGame(indexPlayer: number, gameId?: number): Finish {
    const user = getUserByIndex(indexPlayer);
    users.set(indexPlayer, { ...user, wins: user.wins + 1 });

    if (gameId) {
        games.delete(gameId);
    }

    return { type: 'finish', data: { winPlayer: indexPlayer } }
}

export function singlePlay(userId: number): CreateGame {
    const id = Date.now();

    games.set(
        id,
        {
            gameId: id,
            players: [BOT_ID, userId],
            ships: { [BOT_ID]: botShips.map(ship => ({ ...ship, hp: ship.length })) },
            playersTurn: null
        }
    );


    return { type: 'create_game', data: { idGame: id, idPlayer: userId } }
}