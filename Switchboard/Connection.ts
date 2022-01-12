export default class Connection {
  public readonly websocket: WebSocket;
  public readonly id: string;

  constructor(websocket: WebSocket) {
    this.id = crypto.randomUUID();
    this.websocket = websocket;
    
  }
}
