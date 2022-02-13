import { Lobby } from "../Domain/Lobby.ts";
import { PlayerWTO } from "./PlayerWTO.ts";

export class LobbyWTO {
  public static FromLobby(lobby: Lobby): LobbyWTO {
    const players: PlayerWTO[] = [];

    lobby.players.forEach((v, _k) => {
      players.push(PlayerWTO.FromPlayer(v));
    });
    return new LobbyWTO(lobby.id, players);
  }

  constructor(public key: string, public players: PlayerWTO[]) {}
}
