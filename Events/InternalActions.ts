// deno-lint-ignore-file no-empty-interface
import { Evt } from "../deps.ts";
import { Lobby } from "../Domain/Lobby.ts";
import { Player } from "../Domain/Player.ts";
import User from "../Domain/User.ts";
import { Message } from "../Domain/Message.ts";

export type ActionType =
  | "CreateLobby"
  | "JoinLobby"
  | "SendMessage";

export interface IAction {
  type: ActionType;
  time: number;
}

export abstract class BaseAction implements IAction {
  public time: number;

  constructor(public type: ActionType) {
    this.time = new Date().getTime();
  }
}

export interface ICreateLobbyAction extends IAction {}
export class CreateLobbyAction extends BaseAction
  implements ICreateLobbyAction {
  constructor() {
    super("CreateLobby");
  }
}

export interface ILobbyCreatedAction {
  lobby: Lobby;
  creator: User;
}
export class LobbyCreatedAction implements ILobbyCreatedAction {
  constructor(public lobby: Lobby, public creator: User) {}
}

export interface IJoinLobbyAction extends IAction {
  user: User;
}
export class JoinLobbyAction extends BaseAction implements IJoinLobbyAction {
  constructor(public user: User) {
    super("JoinLobby");
  }
}

export interface IJoinedLobbyAction {
  lobby: Lobby;
  player: Player;
}
export class JoinedLobbyAction implements IJoinedLobbyAction {
  constructor(public lobby: Lobby, public player: Player) {}
}

export interface ISendMessageAction extends IAction {
  message: Message;
}
export class SendMessageAction extends BaseAction
  implements ISendMessageAction {
  constructor(public message: Message) {
    super("SendMessage");
  }
}

export interface ISentMessageAction {
  message: Message;
}
export class SentMessageAction implements ISentMessageAction {
  constructor(public message: Message) {}
}

export class InternalEvents {
  public readonly CreateLobbyBus = Evt.create<ICreateLobbyAction>();
  public readonly LobbyCreatedBus = Evt.create<ILobbyCreatedAction>();

  public readonly JoinLobbyBus = Evt.create<IJoinLobbyAction>();
  public readonly JoinedLobbyBus = Evt.create<IJoinedLobbyAction>();

  public readonly SendMessageBus = Evt.create<ISendMessageAction>();
  public readonly SentMessageBus = Evt.create<ISentMessageAction>();
}

export const InternalEventsSingleton = new InternalEvents();
