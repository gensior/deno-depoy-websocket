import { Lobby } from "../Domain/Lobby.ts";
import { BaseRepo } from "./BaseRepo.ts";

export class LobbyRepository extends BaseRepo<Lobby> {}

export const LobbyRepositorySingleton = new LobbyRepository();
