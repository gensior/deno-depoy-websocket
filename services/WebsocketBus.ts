import Switchboard from "../Switchboard/Switchboard.ts";
import Websocket from "./Websocket.ts";

export default class WebsocketBus {
  private readonly _websocket: Websocket;

  constructor(websocket: Websocket) {
    this._websocket = websocket;
  }

  public send(message: unknown): void {
    console.log("sending message");
    this._websocket.socket.send(JSON.stringify(message));
  }

  public processConnection(): void {
    const w = this._websocket.socket;
    console.log({ w });
    this.send(`Hello!`);
  }
}
