import { randomString } from "../deps.ts";
import { Lobby } from "../Lobby.ts";

class LobbyFactory {

    public Create() : Lobby {
        const id = randomString.cryptoRandomString({length: 4, characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'});
        return new Lobby(id);
    }
}

export default new LobbyFactory();