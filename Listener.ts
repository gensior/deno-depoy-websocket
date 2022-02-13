import {
  InternalEvents,
  InternalEventsSingleton,
} from "./Events/InternalEvents.ts";
import { Message } from "./Message.ts";

export class Listener {
  private events: InternalEvents;

  constructor(events: InternalEvents = InternalEventsSingleton) {
    this.events = events;
  }

  public dispatch(message: Message): void {
    const action: string = message.action.toLowerCase();
    switch (action) {
      case "createlobby":
        this.events.CreateLobby.post({ userId: message.user.id });
        break;
      case "joinlobby":
        this.events.JoinLobby.post({
          lobbyId: message.data.lobbyId,
          userId: message.user.id,
        });
        break;
      case "sendMessage":
        break;
      default:
        console.log("No action.");
    }
  }
}

export const ListenerSingleton = new Listener();
