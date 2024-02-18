import { httpServer } from "./src/http_server";
import {WebSocket, WebSocketServer} from "ws";
import {RequestType, SocketMessage, SocketResponse} from "./src/types/api";
import {getUserByIndex, registerUser, updateWinners} from "./src/controllers/user";
import {addUserToRoom, createRoom, getRoom, removeRoom, updateRooms} from "./src/controllers/room";
import {createGame} from "./src/controllers/game";

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

    ws.on('message', function message(request) {
        const { type, data: jsonData } = JSON.parse(request.toString()) as { type: RequestType, data: string, id: 0 };
        const data = jsonData && JSON.parse(jsonData);

        const socketRequest: SocketMessage = { data, type };

        // обернуть в try catch
        switch (socketRequest.type) {
            case 'reg': {
                send(registerUser(socketRequest.data, ws.userId));
                // updateRoom и winners должны отправляться всем игрокам
                // как только зашел 1 из них
                sendAll(updateRooms());
                sendAll(updateWinners());
                break;
            }
            case 'create_room': {
                const indexRoom = createRoom();
                addUserToRoom(indexRoom, getUserByIndex(ws.userId).name);
                sendAll(updateRooms());
                break;
            }
            case 'add_user_to_room': {
                const { indexRoom } = socketRequest.data;

                addUserToRoom(indexRoom, getUserByIndex(ws.userId).name);

                const room = getRoom(indexRoom);

                if(room.players.length === 2) {
                    const gameRequests = createGame(indexRoom);
                    removeRoom(indexRoom);

                    (wss.clients as Set<ExtWebSocket>).forEach((client) => {
                        const clientRequest = gameRequests.find(request => request.data.idPlayer === client.userId);

                        if (client.readyState === WebSocket.OPEN && clientRequest) {
                            send(clientRequest, client);
                        }
                    });
                }

                sendAll(updateRooms());
                break;
            }
            default:
                throw new Error('Unknown type');
        }
    });
});