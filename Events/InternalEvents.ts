import { Evt } from "../deps.ts";

class InternalEvents {
    public readonly CreateLobby = Evt.create<Record<never, never>>();

    public readonly LobbyCreated = Evt.create<{id: string}>();
}

export default new InternalEvents();