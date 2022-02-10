import { LobbyController, LobbyControllerSingleton } from "../Controllers/LobbyController.ts";
import { InternalEvents, InternalEventsSingleton } from "../Events/InternalEvents.ts";

class LobbyHandler {
    private controller : LobbyController
    private events: InternalEvents

    constructor(controller: LobbyController = LobbyControllerSingleton, events: InternalEvents = InternalEventsSingleton ) {
        this.controller = controller
        this.events = events;

        this.events.CreateLobby.attach((x) => {
            this.createLobby(x.connectionId);
        })

        // this.events.JoinLobby.attach((x) => {
        //     this.joinLobby
        // })
    }

    public createLobby(connectionId: string) : void {
        const lobby = this.controller.create();

        lobby.match({
            ok: (val) => {
                this.events.LobbyCreated.post({ creatorId: connectionId, lobbyId: val.id });
            },
            err: (_val) => {
                // TODO: error message
            }
        })
    }

    // public joinLobby(connectionId: string, lobbyId: string, userId: string) : void {
    //     const user = 
    // }
}

export const LobbyHandlerSingleton = new LobbyHandler();