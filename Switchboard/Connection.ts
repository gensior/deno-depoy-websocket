import User from "../Domain/User.ts";

export default class Connection {
    public readonly websocket: WebSocket;
    public readonly id: string;
    public readonly user: User;

    constructor(websocket: WebSocket, user: User) {
        this.id = crypto.randomUUID();
        this.websocket = websocket;
        this.user = user;
    }
}