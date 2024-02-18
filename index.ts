import { httpServer } from "./src/http_server";
import {WebSocket, WebSocketServer} from "ws";
import {RequestType, SocketMessage, SocketResponse} from "./src/types/api";
import {registerUser, updateWinners} from "./src/services/user";
import {addUserToRoom, createRoom, getRoom, removeRoom, updateRooms} from "./src/services/room";
import { createGame } from "./src/services/game";
import { attack, addShips } from "./src/controllers/game";
import {randomAttack} from "./src/controllers/game";

const HTTP_PORT = 8181;
const WS_PORT = 3000;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

interface ExtWebSocket extends WebSocket {
    userId: number;
}

console.log(`Start Web Socket server on the ${WS_PORT} port!`);
const wss = new WebSocketServer({ port: WS_PORT });

/*
After starting the program displays websocket parameters - где отображать?
    следовательно мне надо вывести что-то вроде : WS server started by ws://localhost:3000/
After program work finished the program should end websocket work correctly - что значит правильно закончить?
    по поводу окончания, сокет в отличии от соединения типа запрос/ответ - потоковое, поэтому его нужно обязательно закрывать при ошибках/окончании работы сервера и т.д.
After each received command program should display the command and result - где отображать?
 */

function getClientByUserId(userId: number): ExtWebSocket | undefined {
    return [...(wss.clients as Set<ExtWebSocket>).values()].find(client => client.userId === userId);
}

let index = 1;

wss.on('connection', function connection(ws: ExtWebSocket) {
    ws.on('error', console.error);
    ws.userId = index++;
    console.log('log');

    function send(response: SocketResponse, targetWs = ws) {
        targetWs.send(JSON.stringify({ ...response, data: JSON.stringify(response.data), id: 0 }));
    }

    function sendAll(response: SocketResponse) {
        (wss.clients as Set<ExtWebSocket>).forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                send(response, client);
            }
        });
    }

    function sendResponses(socketResponses: { id: number, responses: SocketResponse[] }[]) {
        socketResponses.forEach(socketResponse => {
            const client = getClientByUserId(socketResponse.id);

            if (client?.readyState === WebSocket.OPEN) {
                socketResponse.responses.forEach(res => {
                    send(res, client);
                });
            }
        });
    }

    ws.on('message', function message(request) {
        try {
            const { type, data: jsonData } = JSON.parse(request.toString()) as { type: RequestType, data: string, id: 0 };
            const data = jsonData && JSON.parse(jsonData);

            const socketRequest: SocketMessage = { data, type };

            switch (socketRequest.type) {
                case 'reg': {
                    const responseRegister = registerUser(socketRequest.data, ws.userId)
                    send(responseRegister);

                    if (responseRegister.data.index && responseRegister.data.index !== ws.userId) {
                        ws.userId = responseRegister.data.index;
                    }

                    sendAll(updateRooms());
                    sendAll(updateWinners());
                    break;
                }
                case 'create_room': {
                    const indexRoom = createRoom();
                    addUserToRoom(indexRoom, ws.userId);
                    sendAll(updateRooms());
                    break;
                }
                case 'add_user_to_room': {
                    const { indexRoom } = socketRequest.data;

                    addUserToRoom(indexRoom, ws.userId);

                    const room = getRoom(indexRoom);

                    if(room.players.length === 2) {
                        const gameRequests = createGame(indexRoom);
                        removeRoom(indexRoom);

                        gameRequests.forEach(request => {
                            const client = getClientByUserId(request.data.idPlayer);

                            if (client?.readyState === WebSocket.OPEN) {
                                send(request, client);
                            }
                        });
                    }

                    sendAll(updateRooms());
                    break;
                }
                case 'add_ships': {
                    const socketResponses = addShips(socketRequest);

                    if (socketResponses) {
                        sendResponses(socketResponses);
                    }

                    break;
                }
                case 'attack': {
                    const socketResponses = attack(socketRequest);

                    if (socketResponses) {
                        sendResponses(socketResponses);

                    }
                    break;
                }
                case 'randomAttack': {
                    const socketResponses = randomAttack(socketRequest);

                    if (socketResponses) {
                        sendResponses(socketResponses);

                    }

                    break;
                }
                default:
                    throw new Error('Unknown type');
            }
        } catch (e) {
            console.error(e);
        }
    });
});