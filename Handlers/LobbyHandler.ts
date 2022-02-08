import InternalEvents from "../Events/InternalEvents.ts";
import LobbyFactory from "../Factories/LobbyFactory.ts";

class LobbyHandler {
    private factory : typeof LobbyFactory
    private events: typeof InternalEvents

    constructor() {
        this.factory = LobbyFactory
        this.events = InternalEvents;
        this.events.CreateLobby.attach((_x) => {
            this.createLobby();
        })
    }

    public createLobby() : void {
        const lobby = this.factory.Create();
        this.events.LobbyCreated.post({id: lobby.id});
    }
}

export default new LobbyHandler();