import Connection from "./Connection.ts";

export default class Channel {
    public readonly name: string;
    public readonly connections: Map<string, Connection>;
  
    constructor(name: string) {
        this.name = name;
        this.connections = new Map<string, Connection>();
    }
  
    public AddConnection(connection: Connection): void {
        this.connections.set(connection.id, connection);
        //this.Notify(`${connection.id} joined the channel.`);
    }
  
    public RemoveConnection(connectionId: string): void {
        this.connections.delete(connectionId);
        //this.Notify(`${connectionId} left the channel.`);
    }
  
    public Notify(message: unknown): void {
        this.connections.forEach((value) => {
            value.websocket.send(JSON.stringify(message));
        });
    }
  
    public Broadcast(message: unknown, sender: string): void {
        this.connections.forEach((value, key) => {
            if (key != sender) {
                value.websocket.send(JSON.stringify(message));
            }
        });
    }
  }