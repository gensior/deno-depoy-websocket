import { CreateLobby } from "../Actions/CreateLobby.ts";
import { SendMessage } from "../Actions/SendMessage.ts";
import { None, Option, Some } from "../deps.ts";

export type Action =
  | CreateLobby
  | SendMessage;

export class Dispatcher {
  // deno-lint-ignore no-explicit-any
  public parseAction(json: any): Option<Action> {
    if (json.action !== undefined) {
      const action: string = json.action.toLowerCase();
      switch (action) {
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
