import { CreateLobby } from "../Actions/CreateLobby.ts";
import { Mediator } from "../deps.ts";

export class ActionHandler {
  private readonly mediator: Mediator;

  constructor(mediator: Mediator) {
    this.mediator = mediator;

    this.mediator.handle(
      CreateLobby,
      (request) => {
        console.log({ request });
        Promise.resolve();
      },
    );
  }
}
