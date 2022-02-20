import { Err, Ok, Result } from "../deps.ts";
import { Lobby } from "../Domain/Lobby.ts";
import {
  LobbyRepository,
  LobbyRepositorySingleton,
} from "../Repositories/LobbyRepository.ts";

export class LobbyController {
  constructor(private repository: LobbyRepository = LobbyRepositorySingleton) {
    this.repository = repository;
  }

  public create(): Result<Lobby, string> {
    const lobby = Lobby.Create();
    return this.repository.save(lobby);
  }

  public delete(id: string): Result<boolean, string> {
    const lobby = this.get(id);

    return lobby.match({
      ok: (val): Result<boolean, string> => {
        if (this.repository.delete(val.id)) {
          return Ok(true);
        } else {
          return Err("Could not delete lobby.");
        }
      },
      err: (val): Result<boolean, string> => {
        return Err(val);
      },
    });
  }

  public get(id: string): Result<Lobby, string> {
    const lobby = this.repository.get(id);

    return lobby.match({
      some: (val): Result<Lobby, string> => Ok(val),
      none: (): Result<Lobby, string> => Err("Could not find lobby."),
    });
  }
}

export const LobbyControllerSingleton = new LobbyController();
