import {finishGame, getGame, getPlayersTurn, isAllShipsKilled, playersTurn, startGame} from "../services/game";
import {AddShipRequest, AttackRandomRequest, AttackRequest} from "../types/game";
import {attack as attackService, addShips as addShipsService} from "../services/game";
import {getRandomArbitrary} from "../utils";
import {updateWinners} from "../services/user";

export function addShips(request: AddShipRequest) {
    const { gameId, ships, indexPlayer } = request.data;

    addShipsService(gameId, ships, indexPlayer);

    const gameResponses = startGame(gameId);

    const turn = playersTurn(gameId);

    return gameResponses?.map(gameRequest => {
        return {
            id: gameRequest.data.currentPlayerIndex,
            responses: [gameRequest, turn],
        }
    })
}

export function getRandomPosition() {
    return {
        x: Math.round(getRandomArbitrary(0, 9)),
        y: Math.round(getRandomArbitrary(0, 9)),
    }
}

export function attack(request: AttackRequest) {
    const { gameId, indexPlayer, x, y } = request.data;
    const game = getGame(gameId);


    if (getPlayersTurn(gameId) !== indexPlayer) return;

    const attackResponse = attackService(gameId, indexPlayer, { x, y });
    const turn = playersTurn(gameId, indexPlayer, attackResponse.data.status);
    const finish = isAllShipsKilled(gameId, indexPlayer) ? finishGame(indexPlayer) : undefined;

    return game.players.map(playerId => {
        return {
            id: playerId,
            responses: [attackResponse, ...(finish ? [finish, updateWinners()] : [turn])],
        }
    });
}

export function randomAttack(request: AttackRandomRequest) {
    return attack({
        type: 'attack',
        data: {
            gameId: request.data.gameId,
            indexPlayer: request.data.indexPlayer,
            ...getRandomPosition(),
        }
    });
}