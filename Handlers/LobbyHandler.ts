import {
  LobbyController,
  LobbyControllerSingleton,
} from "../Controllers/LobbyController.ts";
import { UserControllerSingleton } from "../Controllers/UserController.ts";
import { UserController } from "../Controllers/UserController.ts";
import { Err, Mediator, Ok, Result } from "../deps.ts";
import { Player } from "../Domain/Player.ts";
import { MediatorSingleton } from "../Mediator/Mediators.ts";
import {
  Broadcast,
  CreateLobbyNotification,
  LobbyCreatedNotification,
  Send,
} from "../Mediator/Notifications.ts";
import { PlayerWTO } from "../WTOs/PlayerWTO.ts";

class LobbyHandler {
  constructor(
    private readonly lobbyController: LobbyController =
      LobbyControllerSingleton,
    private readonly userController: UserController = UserControllerSingleton,
    private readonly mediator: Mediator = MediatorSingleton,
  ) {
    this.lobbyController = lobbyController;
    this.userController = userController;
    this.mediator = mediator;

    this.mediator.handle(CreateLobbyNotification, (notification) => {
      return this.createLobbyHandler(notification);
    });

    this.mediator.handle(LobbyCreatedNotification, (notification) => {
      return this.lobbyCreatedHandler(notification);
    });

    // this.events.JoinLobby.attach((x) => {
    //   this.joinLobbyHandler(x);
    // });
  }

  public createLobbyHandler(
    notification: CreateLobbyNotification,
  ): Promise<void> {
    return this.userController.get(notification.userId)
      .map((user) => {
        this.lobbyController.create().map((lobby) => {
          this.mediator.publish(
            new LobbyCreatedNotification(user.id, lobby.id),
          );
        });
      }).match({
        ok: (_) => Promise.resolve(),
        err: (e) => {
          console.error(e);
          return Promise.reject();
        },
      });
  }

  public lobbyCreatedHandler(
    notification: LobbyCreatedNotification,
  ): Promise<void> {
    return this.mediator.publish(
      new Send(notification.userId, { lobbyKey: notification.lobbyKey }),
    );
  }

  // public joinLobbyHandler(event: IJoinLobby): void {
  //   this.userController.get(event.userId).andThen((user) =>
  //     this.lobbyController.get(event.lobbyId).andThen((lobby) =>
  //       lobby.JoinLobby(user)
  //     )
  //   ).mapErr(console.error);
  // }
}

export const LobbyHandlerSingleton = new LobbyHandler();
