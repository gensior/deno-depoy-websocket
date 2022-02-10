import { randomString } from "../deps.ts";
import { Lobby } from "../Domain/Lobby.ts";

export class LobbyFactory {

    public Create() : Lobby {
        const id = randomString.cryptoRandomString({length: 4, characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'});
        return new Lobby(id);
    }
}

export const LobbyFactorySingleton = new LobbyFactory();