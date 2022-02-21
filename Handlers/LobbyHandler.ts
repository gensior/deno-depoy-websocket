import {
  LobbyController,
  LobbyControllerSingleton,
} from "../Controllers/LobbyController.ts";
import { UserControllerSingleton } from "../Controllers/UserController.ts";
import { UserController } from "../Controllers/UserController.ts";
import { Err, Mediator, Ok, Result } from "../deps.ts";
import { Lobby } from "../Domain/Lobby.ts";
import User from "../Domain/User.ts";
import { MediatorSingleton } from "../Mediator/Mediators.ts";
import {
  Broadcast,
  CreateLobbyNotification,
  JoinLobbyNotification,
  LeaveLobbyNotification,
  LobbyCreatedErrorNotification,
  LobbyCreatedNotification,
  LobbyJoinedErrorNotification,
  LobbyJoinedNotification,
  LobbyLeftNotification,
  NewAdminNotification,
  Notify,
  Send,
} from "../Mediator/Notifications.ts";
import {
  leaveLobbyError,
  leaveLobbySuccess,
  lobbyCreatedError,
  lobbyCreatedSuccess,
  lobbyJoinedError,
  playerJoinedLobby,
  playerLeftLobby,
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
    this.mediator.handle(LobbyJoinedErrorNotification, (x) => {
      return this.lobbyJoinedErrorHandler(x);
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

  public lobbyJoinedErrorHandler(
    notification: LobbyJoinedErrorNotification,
  ): Promise<void> {
    const user = notification.user;
    const reason = notification.err;

    return this.mediator.publish(new Send(user.id, reason));
  }

  public newAdminHandler(
    notification: NewAdminNotification,
  ): Promise<void> {
    const lobby = notification.lobby;
    const admin = notification.admin;

    admin.user.connection.map((conn) => {
      this.mediator.publish(
        new Notify(lobby.id, { newAdmin: conn.id }),
      );
    });

    return Promise.resolve();
  }

  public async lobbyLeftHandler(
    notification: LobbyLeftNotification,
  ): Promise<void> {
    const user = notification.user;
    const lobby = notification.lobby;
    const connId = notification.connId;

    if (user.isConnected()) {
      await this.mediator.publish(
        new Send(user.id, leaveLobbySuccess(lobby.id)),
      );
    }
    this.mediator.publish(new Notify(lobby.id, playerLeftLobby(connId)));

    return Promise.resolve();
  }

  public leaveLobbyHandler(
    notification: LeaveLobbyNotification,
  ): Promise<void> {
    const user = notification.user;
    const connId = notification.connId;
    let lobby: Lobby;
    user.player.match({
      some: (player) => {
        lobby = player.lobby;
        let oldAdminId: string;
        lobby.getAdmin().map((admin) => {
          oldAdminId = admin.id;
        });
        lobby.leaveLobby(player).match({
          ok: (_x) => {
            this.mediator.publish(
              new LobbyLeftNotification(connId, user, lobby),
            );
            lobby.getAdmin().map((currentAdmin) => {
              if (currentAdmin.id !== oldAdminId) {
                this.mediator.publish(
                  new NewAdminNotification(currentAdmin, lobby),
                );
              }
            });
          },
          err: (e) => {
            this.mediator.publish(
              new Send(user.id, leaveLobbyError(e)),
            );
          },
        });
      },
      none: () => {
        this.mediator.publish(
          new Send(user.id, leaveLobbyError("User not in lobby.")),
        );
      },
    });

    return Promise.resolve();
  }

  public lobbyJoinedHandler(
    notification: LobbyJoinedNotification,
  ): Promise<void> {
    const user = notification.user;
    const lobby = notification.lobby;

    user.player.map((player) => {
      this.mediator.publish(
        new Send(user.id, LobbyWTO.FromLobby(lobby)),
      );
      this.mediator.publish(
        new Broadcast(
          user.id,
          lobby.id,
          playerJoinedLobby(PlayerWTO.FromPlayer(player)),
        ),
      );
    });

    return Promise.resolve();
  }

  public joinLobbyHandler(notification: JoinLobbyNotification): Promise<void> {
    const lobbyKey = notification.lobbyKey;

    let lobby: Lobby;
    const user: User = notification.user;

    this.lobbyController.get(lobbyKey)
      .andThen((l) => {
        lobby = l;

        if (user.isPlaying()) {
          return Err("User is already in a lobby.");
        }

        return lobby.JoinLobby(user);
      }).match({
        ok: (_) => {
          this.mediator.publish(
            new LobbyJoinedNotification(
              user,
              lobby,
            ),
          );
        },
        err: (err) => {
          this.mediator.publish(new Send(user.id, lobbyJoinedError(err)));
        },
      });

    return Promise.resolve();
  }

  public createLobbyHandler(
    notification: CreateLobbyNotification,
  ): Promise<void> {
    const user: User = notification.user;
    let lobby: Lobby;

    if (user.isPlaying()) {
      this.mediator.publish(
        new LobbyCreatedErrorNotification(user, "User is already in a lobby"),
      );
    } else {
      this.lobbyController.create().match({
        ok: (l): Result<User, string> => {
          return l.JoinLobby(user).match({
            ok: (lob): Result<User, string> => {
              lobby = lob;
              return Ok(user);
            },
            err: (err): Result<User, string> => Err(err),
          });
        },
        err: (err): Result<User, string> => Err(err),
      })
        .match({
          ok: (_) => {
            this.mediator.publish(new LobbyCreatedNotification(user, lobby));
          },
          err: (e) => {
            console.error(e);
            this.mediator.publish(
              new LobbyCreatedErrorNotification(user, e),
            );
          },
        });
    }

    return Promise.resolve();
  }

  public lobbyCreatedErrorHandler(
    notification: LobbyCreatedErrorNotification,
  ): Promise<void> {
    const user = notification.user;
    const reason = notification.err;

    return this.mediator.publish(new Send(user.id, lobbyCreatedError(reason)));
  }

  public lobbyCreatedHandler(
    notification: LobbyCreatedNotification,
  ): Promise<void> {
    const lobby = notification.lobby;
    const user = notification.user;

    return this.mediator.publish(
      new Send(
        user.id,
        lobbyCreatedSuccess(LobbyWTO.FromLobby(lobby)),
      ),
    );
  }
}

export const LobbyHandlerSingleton = new LobbyHandler();
