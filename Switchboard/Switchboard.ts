import { Mediator, None, Option, Some } from "../deps.ts";
import Channel from "./Channel.ts";
import Connection from "./Connection.ts";
import { Dispatcher } from "./Dispatcher.ts";

export default class Switchboard {
  private readonly connections: Map<string, Connection>;
  private readonly channels: Map<string, Channel>;
  private readonly connectionsToChannels: Map<string, string>;
  private readonly dispatcher: Dispatcher;
  private readonly mediator: Mediator;

  constructor(dispatcher: Dispatcher, mediator: Mediator) {
    this.connections = new Map<string, Connection>();
    this.channels = new Map<string, Channel>();
    this.connectionsToChannels = new Map<string, string>();
    this.dispatcher = dispatcher;
    this.mediator = mediator;
  }

  public registerSocket(websocket: WebSocket): Connection {
    const connection = new Connection(websocket);
    this.connections.set(connection.id, connection);
    connection.websocket.send(`Socket Id: ${connection.id}`);
    return connection;
  }

  public disconnectSocket(connection: Connection): void {
    this.connections.delete(connection.id);

    if (this.connectionsToChannels.has(connection.id)) {
      this.dropFromChannel(connection);
    }
  }

  public getSocket(id: string): Option<Connection> {
    const result = this.connections.get(id);
    if (result) return Some(result);
    else return None;
  }

  public dispatch(message: unknown): void {
    const action = this.dispatcher.parseAction(message);

    action.match({
      some: (a) => {
        this.mediator.send(a);
      },
      none: () => console.log("no action to take"),
    });
  }

  public joinChannel(name: string, connection: Connection): void {
    let channel: Channel;
    if (this.channels.has(name)) {
      channel = this.channels.get(name)!;
    } else {
      channel = new Channel(name);
      this.channels.set(name, channel);
    }

    this.dropFromChannel(connection);

    channel.AddConnection(connection);
    this.connectionsToChannels.set(connection.id, name);
  }

  public dropFromChannel(connection: Connection): void {
    if (this.connectionsToChannels.has(connection.id)) {
      const channel = this.channels.get(
        this.connectionsToChannels.get(connection.id)!,
      );
      channel?.RemoveConnection(connection.id);

      if (!channel?.connections.size) {
        this.channels.delete(channel?.name!);
      }

      if (this.connectionsToChannels.has(connection.id)) {
        this.connectionsToChannels.delete(connection.id);
      }
    }
  }

  public getSocketIds(): string[] {
    const results: string[] = [];
    this.connections.forEach((x) => {
      results.push(x.id);
    });

    return results;
  }

  public listChannels(): string[] {
    const results: string[] = [];
    this.channels.forEach((x) => {
      results.push(x.name);
    });

    return results;
  }
}
