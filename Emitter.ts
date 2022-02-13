import {
  LobbyController,
  LobbyControllerSingleton,
} from "./Controllers/LobbyController.ts";
import { Err, Ok, Result } from "./deps.ts";
import {
  IJoinedLobby,
  ILobbyCreated,
  InternalEvents,
  InternalEventsSingleton,
} from "./Events/InternalEvents.ts";
import Connection from "./Switchboard/Connection.ts";
import {
  Switchboard,
  SwitchboardSingleton,
} from "./Switchboard/Switchboard.ts";
import { LobbyWTO } from "./WTOs/LobbyWTO.ts";
import { PlayerWTO } from "./WTOs/PlayerWTO.ts";

export class Emitter {
  private lobbyController: LobbyController;
  private switchboard: Switchboard;
  private events: InternalEvents;

  constructor(
    switchboard: Switchboard = SwitchboardSingleton,
    events: InternalEvents = InternalEventsSingleton,
    lobbyController: LobbyController = LobbyControllerSingleton,
  ) {
    this.lobbyController = lobbyController;
    this.switchboard = switchboard;
    this.events = events;

    this.events.LobbyCreated.attach((x) => {
      this.lobbyCreatedHandler(x);
    });

    this.events.JoinedLobby.attach((x) => {
      this.joinedLobbyHandler(x);
    });
  }

  public lobbyCreatedHandler(x: ILobbyCreated): void {
    const message = JSON.stringify({ id: x.lobbyId });
    this.switchboard.Send(message, x.creatorId);
  }

  public joinedLobbyHandler(x: IJoinedLobby): void {
    // Get lobby
    this.lobbyController.get(x.lobbyId).andThen((lobby) =>
      lobby.getPlayer(x.playerId).andThen((player) =>
        player.user.connection.match({
          some: (conn): Result<Connection, string> => {
            this.switchboard.Send(
              JSON.stringify(LobbyWTO.FromLobby(lobby)),
              conn.id,
            );
            lobby.Broadcast(
              JSON.stringify(PlayerWTO.FromPlayer(player)),
              player.id,
            );
            return Ok(conn);
          },
          none: (): Result<Connection, string> => Err("No connection found."),
        })
      )
    ).mapErr((err) => console.error(err));
  }
}

export const EmitterSingleton = new Emitter();
