import { ICreateLobby, InternalEvents,InternalEventsSingleton } from "./Events/InternalEvents.ts";
import { Message } from "./Message.ts";

export class Listener {
    private events : InternalEvents

    constructor(events: InternalEvents = InternalEventsSingleton) {
        this.events = events;
    }
    
    public dispatch(message: Message) : void {
        const action: string = message.action.toLowerCase();
        switch (action) {
        case "createlobby":
            this.events.CreateLobby.post({ connectionId: message.connectionId });
            break;
        case "joinlobby":
            this.events.JoinLobby.post({connectionId: message.connectionId, lobbyId: message.data.lobbyId, userId: message.data.userId});
            break;
        default:
            console.log("No action.");
        }
    }
}

export const ListenerSingleton = new Listener()