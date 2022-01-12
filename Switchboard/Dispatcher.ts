import { CreateLobby } from "../Actions/CreateLobby.ts";
import { SendMessage } from "../Actions/SendMessage.ts";
import { None, Option, Some } from "../deps.ts";

export type Action =
  | CreateLobby
  | SendMessage;

export class Dispatcher {
  public parseAction(message: string): Option<Action> {
    const json = JSON.parse(message);
    if (json.action !== undefined) {
      const action: string = json.action;
      switch (action.toLowerCase()) {
        case "createlobby":
          return Some<CreateLobby>(
            new CreateLobby(json.data.name, json.data.user),
          );
        case "sendmessage":
          return Some<SendMessage>(new SendMessage(json.data.message));
        default:
          return None;
      }
    } else {
      return None;
    }
  }
}
