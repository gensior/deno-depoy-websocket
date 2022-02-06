import { CreateLobby } from "../Actions/CreateLobby.ts";
import { SendMessage } from "../Actions/SendMessage.ts";
import { None, Option, Some } from "../deps.ts";
import { Message } from "../Message.ts";

export type Action =
  | CreateLobby
  | SendMessage;

export class Dispatcher {
  public parseAction(message: Message): Option<Action> {
    const action: string = message.action.toLowerCase();
    switch (action) {
      case "createlobby":
        return Some<CreateLobby>(
          new CreateLobby(message.data.name, message.clientId),
        );
      case "sendmessage":
        return Some<SendMessage>(new SendMessage(message.data.message));
      default:
        return None;
    }
  }
}
