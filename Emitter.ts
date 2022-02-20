import {
  UserController,
  UserControllerSingleton,
} from "./Controllers/UserController.ts";
import { Mediator } from "./deps.ts";
import { MediatorSingleton } from "./Mediator/Mediators.ts";
import {
  Broadcast,
  LobbyCreatedNotification,
  Send,
} from "./Mediator/Notifications.ts";
import {
  Switchboard,
  SwitchboardSingleton,
} from "./Switchboard/Switchboard.ts";
import { PlayerWTO } from "./WTOs/PlayerWTO.ts";

export class Emitter {
  constructor(
    private readonly switchboard: Switchboard = SwitchboardSingleton,
    private readonly mediator: Mediator = MediatorSingleton,
    private readonly userController: UserController = UserControllerSingleton,
  ) {
  }
}
