import { CreateLobby } from "../Actions/CreateLobby.ts";
import { Mediator } from "../deps.ts";
import { LobbyCreated } from "../Notifications/LobbyCreated.ts";
import Switchboard from "../Switchboard/Switchboard.ts";

export class ActionHandler {
  private readonly mediator: Mediator;
  private readonly switchboard: Switchboard;

  constructor(mediator: Mediator, switchboard: Switchboard) {
    this.mediator = mediator;
    this.switchboard = switchboard;

    this.mediator.handle(
      CreateLobby,
      (request) => {
        this.mediator.publish(new LobbyCreated(request.name, request.user))
        Promise.resolve();
      },
    );

    this.mediator.handle(LobbyCreated,(notification) => {
      const creatorId = notification.creatorId;
      const name = notification.name;

      const socketOption = this.switchboard.getSocket(creatorId);

      socketOption.match({
        some: val => {
          val.websocket.send(JSON.stringify({name, creatorId}));
        },
        none: () => console.log(`Could not return notification 'LobbyCreated' to socket '${creatorId}'.`)
      })

      return Promise.resolve();
    })
  }
}
