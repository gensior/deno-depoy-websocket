import { Result,Ok,Err } from "../deps.ts";
import { Lobby } from "../Domain/Lobby.ts";
import { LobbyRepository, LobbyRepositorySingleton } from "../Repositories/LobbyRepository.ts";

export class LobbyController {
    private repository : LobbyRepository

    constructor(repository: LobbyRepository = LobbyRepositorySingleton) {
        this.repository = repository;
    }

    public create() : Result<Lobby, string> {
        const lobby = Lobby.Create();
        const lobbyResult = this.repository.save(lobby);

        return lobbyResult.match({
            ok: (val) : Result<Lobby, string> => {
                return Ok(val)
            },
            err: (val) : Result<Lobby, string> => {
                return Err(val)
            }
        })
    }

    public delete(id: string) : Result<boolean, string> {
        const lobby = this.get(id);

        return lobby.match({
            ok: (val) : Result<boolean, string> => {
                if (this.repository.delete(val.id)) {
                    return Ok(true);
                } else {
                    return Err("Could not delete lobby.");
                }
            },
            err: (val) : Result<boolean, string> => {
                return Err(val);
            }
        })
    }

    public get(id: string) : Result<Lobby, string> {
        const lobby = this.repository.get(id);

        return lobby.match({
            some: (val) : Result<Lobby, string> => Ok(val),
            none: () : Result<Lobby, string> => Err("Could not find lobby.")
        })
    }
}

export const LobbyControllerSingleton = new LobbyController();