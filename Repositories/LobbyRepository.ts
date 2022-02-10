import { Err, None, Ok, Option, Result, Some } from "../deps.ts";
import { Lobby } from "../Domain/Lobby.ts";

export class LobbyRepository {
    private lobbies: Map<string, Lobby>;

    constructor() {
        this.lobbies = new Map<string, Lobby>();
    }

    save(lobby: Lobby) : Result<Lobby, string> {
        if (!this.lobbies.has(lobby.id)) {
            this.lobbies.set(lobby.id, lobby);
            return Ok(lobby)
        } else {
            return Err("Lobby already exists with the same name.");
        }
    }

    delete(id: string) : boolean {
        return this.lobbies.delete(id);
    }

    get(id: string) : Option<Lobby> {
        const lobby = this.lobbies.get(id);
        if (lobby) {
            return Some(lobby);
        } else {
            return None;
        }
    }
}

export const LobbyRepositorySingleton = new LobbyRepository();