import { InternalEvents, InternalEventsSingleton } from "../Events/InternalEvents.ts";
import { Message } from "../Message.ts";

export class SocketHandler {
    private events: InternalEvents
    private socket: WebSocket;

    constructor(events: InternalEvents = InternalEventsSingleton, socket: WebSocket) {
        this.events = events;
        this.socket = socket;

        this.events.LobbyCreated.attach((x) => {
            this.socket.send(JSON.stringify(x));
        })
    }
}