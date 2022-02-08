import InternalEvents from "../Events/InternalEvents.ts";
import { Message } from "../Message.ts";

export class SocketHandler {
    private events: typeof InternalEvents
    private socket: WebSocket;

    constructor(socket: WebSocket) {
        this.events = InternalEvents;
        this.socket = socket;

        this.events.LobbyCreated.attach((x) => {
            this.socket.send(JSON.stringify(x));
        })
    }

    public dispatch(message: Message) : void {
        const action: string = message.action.toLowerCase();
        switch (action) {
        case "createlobby":
            this.events.CreateLobby.post({});
            break;
        default:
            console.log("No action.");
        }
    }
}