import {
  LobbyController,
  LobbyControllerSingleton,
} from "../Controllers/LobbyController.ts";
import { UserControllerSingleton } from "../Controllers/UserController.ts";
import { UserController } from "../Controllers/UserController.ts";
import {
  ICreateLobby,
  IJoinLobby,
  InternalEvents,
  InternalEventsSingleton,
} from "../Events/InternalEvents.ts";

class LobbyHandler {
  private lobbyController: LobbyController;
  private userController: UserController;
  private events: InternalEvents;
  private lobbyControllerCreate;

  constructor(
    controller: LobbyController = LobbyControllerSingleton,
    userController: UserController = UserControllerSingleton,
    events: InternalEvents = InternalEventsSingleton,
  ) {
    this.lobbyController = controller;
    this.lobbyControllerCreate = controller.create;
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
    this.userController.get(event.userId)
      .andThen((user) => this.lobbyController.create(user))
      .mapErr(console.error);
  }

  public joinLobbyHandler(event: IJoinLobby): void {
    this.userController.get(event.userId).andThen((user) =>
      this.lobbyController.get(event.lobbyId).andThen((lobby) =>
        lobby.JoinLobby(user)
      )
    ).mapErr(console.error);
  }
}

export const LobbyHandlerSingleton = new LobbyHandler();
