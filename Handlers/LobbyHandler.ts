import {
  LobbyController,
  LobbyControllerSingleton,
} from "../Controllers/LobbyController.ts";
import { UserControllerSingleton } from "../Controllers/UserController.ts";
import { UserController } from "../Controllers/UserController.ts";
import { Err, Ok, Result } from "../deps.ts";
import { Lobby } from "../Domain/Lobby.ts";
import User from "../Domain/User.ts";
import {
  ICreateLobby,
  IJoinLobby,
  InternalEvents,
  InternalEventsSingleton,
} from "../Events/InternalEvents.ts";
import { PlayerWTO } from "../WTOs/PlayerWTO.ts";

class LobbyHandler {
  private controller: LobbyController;
  private userController: UserController;
  private events: InternalEvents;

  constructor(
    controller: LobbyController = LobbyControllerSingleton,
    userController: UserController = UserControllerSingleton,
    events: InternalEvents = InternalEventsSingleton,
  ) {
    this.controller = controller;
    this.userController = userController;
    this.events = events;

    this.events.CreateLobby.attach((x) => {
      this.createLobbyHandler(x);
    });

    this.events.JoinLobby.attach((x) => {
      this.joinLobbyHandler(x);
    });
  }

  public createLobbyHandler(event: ICreateLobby): void {
    this.userController.get(event.userId).andThen((user) => {
      return user.connection.match({
        some: (x) => {
          return this.controller.create().andThen((lobby) => {
            this.events.LobbyCreated.post({
              creatorId: x.id,
              lobbyId: lobby.id,
            });
            return Ok(lobby);
          });
        },
        none: (): Result<Lobby, string> =>
          Err("User does not have a connection."),
      });
    }).mapErr((err) => console.error(err));
  }

  public joinLobbyHandler(event: IJoinLobby): void {
    this.userController.get(event.userId).andThen((user) =>
      this.controller.get(event.lobbyId).andThen((lobby) =>
        lobby.JoinLobby(user)
      )
    ).match({
      ok: (player) => {
        this.events.JoinedLobby.post({
          lobbyId: event.lobbyId,
          playerId: player.id,
        });
      },
      err: (e) => {
        console.error(e);
      },
    });
  }
}

export const LobbyHandlerSingleton = new LobbyHandler();
