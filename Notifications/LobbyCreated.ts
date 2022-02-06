import { Notification } from "../deps.ts";

export class LobbyCreated extends Notification {
    constructor(public name: string, public creatorId: string) {
        super();
    }
}