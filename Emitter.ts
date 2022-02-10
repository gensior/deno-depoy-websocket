import { InternalEvents, InternalEventsSingleton } from "./Events/InternalEvents.ts";
import { Switchboard, SwitchboardSingleton } from "./Switchboard/Switchboard.ts";

export class Emitter {
    private switchboard : Switchboard;
    private events : InternalEvents;

    constructor(switchboard : Switchboard = SwitchboardSingleton, events: InternalEvents = InternalEventsSingleton) {
        this.switchboard = switchboard;
        this.events = events;

        this.events.LobbyCreated.attach((x) => {
            const message = JSON.stringify({id: x.lobbyId});
            this.switchboard.Send(message, x.creatorId);
        })
    }


}

export const EmitterSingleton = new Emitter();