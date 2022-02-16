import {
  UserController,
  UserControllerSingleton,
} from "../Controllers/UserController.ts";
import { None, Option, Some } from "../deps.ts";
import User from "../Domain/User.ts";
import Connection from "./Connection.ts";

export class Switchboard {
  private readonly connections: Map<string, Connection>;
  private readonly usersController: UserController;
  private readonly connectionsToChannels: Map<string, string>;

  constructor() {
    this.connections = new Map<string, Connection>();
    this.connectionsToChannels = new Map<string, string>();
    this.usersController = UserControllerSingleton;
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

  public Send(message: string, recipient: string): void {
    this.usersController.get(recipient).map((user) => {
      user.connection.map((connection) => {
        connection.websocket.send(JSON.stringify(message));
      });
    });
  }
}

export const SwitchboardSingleton = new Switchboard();
