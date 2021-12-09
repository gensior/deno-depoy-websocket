import { None, Option, Some } from "../deps.ts";
import Connection from "./Connection.ts";

export default class Switchboard {
  private readonly connections: Map<string, Connection>;

  constructor() {
    this.connections = new Map<string, Connection>();
  }

  public registerSocket(websocket: WebSocket): Connection {
    const connection = new Connection(websocket);
    this.connections.set(connection.id, connection);
    connection.websocket.send(`Socket Id: ${connection.id}`);
    return connection;
  }

  public disconnectSocket(connection: Connection): void {
    this.connections.delete(connection.id);
  }

  public getSocket(id: string): Option<Connection> {
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
}
