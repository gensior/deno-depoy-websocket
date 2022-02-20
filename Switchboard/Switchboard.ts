import {
  LobbyController,
  LobbyControllerSingleton,
} from "../Controllers/LobbyController.ts";
import {
  UserController,
  UserControllerSingleton,
} from "../Controllers/UserController.ts";
import { Mediator, None, Option, Some } from "../deps.ts";
import { Lobby } from "../Domain/Lobby.ts";
import User from "../Domain/User.ts";
import { MediatorSingleton } from "../Mediator/Mediators.ts";
import {
  Broadcast,
  CreateLobbyNotification,
  Notify,
  Send,
} from "../Mediator/Notifications.ts";
import { SocketMessage } from "../SocketMessage.ts";
import Connection from "./Connection.ts";

export class Switchboard {
  constructor(
    private readonly connections: Map<string, Connection> = new Map<
      string,
      Connection
    >(),
    private readonly lobbyController: LobbyController =
      LobbyControllerSingleton,
    private readonly usersController: UserController = UserControllerSingleton,
    private readonly mediator: Mediator = MediatorSingleton,
  ) {
    this.mediator = mediator;
    this.mediator.handle(Send, (notification) => {
      const message = JSON.stringify(notification.message);
      const recipientId = notification.recipientId;
      this.Send(message, recipientId);

      return Promise.resolve();
    });

    this.mediator.handle(Notify, (notification) => {
      const message = JSON.stringify(notification.message);
      this.Notify(notification.lobbyKey, message);

      return Promise.resolve();
    });

    this.mediator.handle(Broadcast, (notification) => {
      const broadcasterId = notification.broadcasterId;
      const message = JSON.stringify(notification.message);
      this.Broadcast(notification.lobbyKey, message, broadcasterId);

      return Promise.resolve();
    });
  }

  public registerSocket(websocket: WebSocket, user: User): Connection {
    const connection = new Connection(websocket, user);
    user.setConnection(connection);
    this.connections.set(connection.id, connection);
    return connection;
  }

  public disconnectSocket(connection: Connection): void {
    this.connections.delete(connection.id);

    connection.user.isPlaying();

    connection.user.player.match({
      some: (player) => {
        player.leaveLobby();
      },
      none: () => {},
    });
  }

  public getConnection(id: string): Option<Connection> {
    const result = this.connections.get(id);
    if (result) return Some(result);
    else return None;
  }

  public getSocketIds(): string[] {
    const results: string[] = [];
    this.connections.forEach((x) => {
      results.push(x.id);
    });

    return results;
  }

  public async dispatch(message: SocketMessage): Promise<void> {
    const action: string = message.action.toLowerCase();
    switch (action) {
      case "createlobby":
        await this.mediator.publish(
          new CreateLobbyNotification(message.user.id),
        );
        // this.events.CreateLobbyBus.post(new CreateLobbyAction());
        break;
      case "joinlobby":
        // this.events.JoinLobby.post({
        //   lobbyId: message.data.lobbyId,
        //   userId: message.user.id,
        // });
        break;
      case "sendMessage":
        break;
      default:
        console.log("No action.");
    }
  }

  public Send(message: string, recipient: string): void {
    this.usersController.get(recipient).map((user) => {
      user.connection.map((connection) => {
        connection.websocket.send(JSON.stringify(message));
      });
    });
  }

  public Notify(lobbyKey: string, message: string): void {
    this.lobbyController.get(lobbyKey).map((lobby) => {
      lobby.players.forEach((value) => {
        value.user.connection.match({
          some: (val) => val.websocket.send(message),
          none: () => {},
        });
      });
    });
  }

  public Broadcast(lobbyKey: string, message: string, sender: string): void {
    this.lobbyController.get(lobbyKey).map((lobby) => {
      lobby.players.forEach((value, key) => {
        if (key != sender) {
          value.user.connection.match({
            some: (val) => val.websocket.send(message),
            none: () => {},
          });
        }
      });
    });
  }
}

export const SwitchboardSingleton = new Switchboard();
