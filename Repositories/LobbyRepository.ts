import { Lobby } from "../Domain/Lobby.ts";
import { BaseRepo } from "./BaseRepo.ts";

export class LobbyRepository extends BaseRepo<Lobby> {
  constructor() {
    super();
  }
}

export const LobbyRepositorySingleton = new LobbyRepository();
