import {WebSocket, WebSocketServer} from 'ws';
import {RequestType, SocketMessage, SocketResponse} from "../types/api";
import {registerUser, updateWinners, userDisconnect} from "../services/user";
import {addUserToRoom, createRoom, getRoom, removeRoom, updateRooms} from "../services/room";
import {createGame, singlePlay} from "../services/game";
import {addShips, attack, randomAttack} from "../controllers/game";
import * as console from "console";
import {BOT_ID} from "../botConstants";
import {Turn} from "../types/game";

interface ExtWebSocket extends WebSocket {
    userId: number;
}


export function createWebSocketServer(port: number) {
    const wss = new WebSocketServer({ port });

    function getClientByUserId(userId: number): ExtWebSocket | undefined {
        return [...(wss.clients as Set<ExtWebSocket>).values()].find(client => client.userId === userId);
    }

    let index = 1;

    wss.on('connection', function connection(ws: ExtWebSocket) {
        ws.on('error', console.error);
        ws.userId = index++;

        function send(response: SocketResponse, targetWs = ws) {
            console.log('Send:', response)
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

            const botResponse = socketResponses.find(response => response.id === BOT_ID);

            if (botResponse) {
                const turn = botResponse.responses.find(response => response.type === 'turn') as Turn | undefined;

                if (turn && turn.data.currentPlayer === BOT_ID) {
                    console.log('bot attack');
                    const attackResponse = randomAttack({ type: 'randomAttack', data: { gameId: turn.data.gameId!, indexPlayer: BOT_ID } });

                    if (attackResponse) {
                        sendResponses(attackResponse);
                    }

                }
            }
        }

        ws.on('message', function message(request) {
            try {
                const { type, data: jsonData } = JSON.parse(request.toString()) as { type: RequestType, data: string, id: 0 };
                const data = jsonData && JSON.parse(jsonData);

                const socketRequest: SocketMessage = { data, type };

                console.log('Received:', socketRequest)

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
                            const gameResponses = createGame(indexRoom);
                            removeRoom(indexRoom);

                            gameResponses.forEach(response => {
                                const client = getClientByUserId(response.data.idPlayer);

                                if (client?.readyState === WebSocket.OPEN) {
                                    send(response, client);
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

                    case 'single_play': {
                        send(singlePlay(ws.userId));

                        break;
                    }
                    default:
                        throw new Error('Unknown type');
                }
            } catch (e) {
                console.error(e);
            }
        });

        ws.on('close', function close() {
            try {
                const socketResponses = userDisconnect(ws.userId);

                if (socketResponses) {
                    sendResponses(socketResponses);
                }
            } catch (e) {
                console.error(e);
            }
        });
    });

    return wss;
}