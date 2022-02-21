import {
  LobbyController,
  LobbyControllerSingleton,
} from "../Controllers/LobbyController.ts";
import { UserControllerSingleton } from "../Controllers/UserController.ts";
import { UserController } from "../Controllers/UserController.ts";
import { Mediator } from "../deps.ts";
import { MediatorSingleton } from "../Mediator/Mediators.ts";
import {
  Broadcast,
  CreateLobbyNotification,
  JoinLobbyNotification,
  LeaveLobbyNotification,
  LobbyCreatedErrorNotification,
  LobbyCreatedNotification,
  LobbyJoinedNotification,
  LobbyLeftNotification,
  NewAdminNotification,
  Notify,
  Send,
} from "../Mediator/Notifications.ts";
import {
  lobbyCreatedError,
  lobbyCreatedSuccess,
} from "../Mediator/Responses.ts";
import { LobbyWTO } from "../WTOs/LobbyWTO.ts";
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

    this.mediator.handle(LobbyCreatedErrorNotification, (x) => {
      return this.lobbyCreatedErrorHandler(x);
    });

    this.mediator.handle(JoinLobbyNotification, (notification) => {
      return this.joinLobbyHandler(notification);
    });

    this.mediator.handle(LobbyJoinedNotification, (notification) => {
      return this.lobbyJoinedHandler(notification);
    });

    this.mediator.handle(LeaveLobbyNotification, (notification) => {
      return this.leaveLobbyHandler(notification);
    });

    this.mediator.handle(LobbyLeftNotification, (notification) => {
      return this.lobbyLeftHandler(notification);
    });

    this.mediator.handle(NewAdminNotification, (notification) => {
      return this.newAdminHandler(notification);
    });
  }

  public newAdminHandler(
    notification: NewAdminNotification,
  ): Promise<void> {
    const lobbyKey = notification.lobbyKey;
    return this.lobbyController.get(lobbyKey).map((lobby) => {
      lobby.getAdmin().map((admin) => {
        admin.user.connection.map((conn) => {
          this.mediator.publish(
            new Notify(lobbyKey, { newAdmin: conn.id }),
          );
        });
      });
    }).match({
      ok: (_) => Promise.resolve(),
      err: (e) => {
        console.error(e);
        return Promise.reject();
      },
    });
  }

  public lobbyLeftHandler(
    notification: LobbyLeftNotification,
  ): Promise<void> {
    const userId = notification.userId;
    const lobbyKey = notification.lobbyKey;
    return this.lobbyController.get(lobbyKey).map((lobby) => {
      this.userController.get(userId).map((user) => {
        user.connection.map((conn) => {
          this.mediator.publish(new Notify(lobby.id, { userLeft: conn.id }));
        });
      });
    }).match({
      ok: (_) => Promise.resolve(),
      err: (e) => {
        console.error(e);
        return Promise.reject();
      },
    });
  }

  public leaveLobbyHandler(
    notification: LeaveLobbyNotification,
  ): Promise<void> {
    const userId = notification.userId;
    return this.userController.getPlayerFromUserId(userId).map((player) => {
      const lobby = player.lobby;
      let newadmin = false;
      lobby.getAdmin().map((admin) => {
        newadmin = admin.id === player.id;
      });
      lobby.leaveLobby(player).map((_) => {
        this.mediator.publish(
          new LobbyLeftNotification(userId, lobby.id),
        );
        if (newadmin) {
          this.mediator.publish(
            new NewAdminNotification(player.id, lobby.id),
          );
        }
      });
    }).match({
      some: (_) => Promise.resolve(),
      none: () => {
        //console.error(e);
        return Promise.reject();
      },
    });
  }

  public lobbyJoinedHandler(
    notification: LobbyJoinedNotification,
  ): Promise<void> {
    return this.lobbyController.get(notification.lobbyKey).map((lobby) => {
      this.userController.get(notification.userId).map((user) => {
        user.player.map((player) => {
          this.mediator.publish(
            new Send(notification.userId, LobbyWTO.FromLobby(lobby)),
          );
          this.mediator.publish(
            new Broadcast(
              notification.userId,
              notification.lobbyKey,
              PlayerWTO.FromPlayer(player),
            ),
          );
        });
      });
    }).match({
      ok: (_) => Promise.resolve(),
      err: (e) => {
        console.error(e);
        return Promise.reject();
      },
    });
  }

  public joinLobbyHandler(notification: JoinLobbyNotification): Promise<void> {
    return this.lobbyController.get(notification.lobbyKey).map((lobby) => {
      this.userController.get(notification.userId).map((user) => {
        lobby.JoinLobby(user).map((_) => {
          this.mediator.publish(
            new LobbyJoinedNotification(
              notification.userId,
              notification.lobbyKey,
            ),
          );
        });
      });
    }).match({
      ok: (_) => Promise.resolve(),
      err: (e) => {
        console.error(e);
        return Promise.reject();
      },
    });
  }

  public createLobbyHandler(
    notification: CreateLobbyNotification,
  ): Promise<void> {
    const userId = notification.userId;
    return this.userController.get(notification.userId)
      .andThen((_) => this.lobbyController.create())
      .match({
        ok: (lobby) => {
          this.mediator.publish(new LobbyCreatedNotification(userId, lobby.id));
          return Promise.resolve();
        },
        err: (e) => {
          this.mediator.publish(new LobbyCreatedErrorNotification(userId, e));
          console.error(e);
          return Promise.reject();
        },
      });
  }

  public lobbyCreatedErrorHandler(
    notification: LobbyCreatedErrorNotification,
  ): Promise<void> {
    return this.mediator.publish(
      new Send(notification.userId, lobbyCreatedError(notification.err)),
    );
  }

  public lobbyCreatedHandler(
    notification: LobbyCreatedNotification,
  ): Promise<void> {
    return this.mediator.publish(
      new Send(notification.userId, lobbyCreatedSuccess(notification.lobbyKey)),
    );
  }
}

export const LobbyHandlerSingleton = new LobbyHandler();
