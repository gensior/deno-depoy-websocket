import { Evt } from "../deps.ts";

export type EventType =
  | "CreateLobby"
  | "JoinLobby"
  | "SendMessage";

export interface ISocketEvent {
  userId: string;
  type: EventType;
}
export abstract class BaseSocketEvent implements ISocketEvent {
  constructor(public userId: string, public type: EventType) {}
}

// deno-lint-ignore no-empty-interface
export interface ICreateLobbyEvent extends ISocketEvent {
}
export class CreateLobbyEvent extends BaseSocketEvent
  implements ICreateLobbyEvent {
  constructor(public userId: string) {
    super(userId, "CreateLobby");
  }
}
export const CreateLobbyEventBus = Evt.create<ICreateLobbyEvent>();

export interface IJoinLobbyEvent extends ISocketEvent {
  lobbyId: string;
}
export class JoinLobbyEvent extends BaseSocketEvent implements IJoinLobbyEvent {
  constructor(public lobbyId: string, public userId: string) {
    super(userId, "JoinLobby");
  }
}
export const JoinLobbyEventBus = Evt.create<IJoinLobbyEvent>();

export interface ISendMessageEvent extends ISocketEvent {
  lobbyId: string;
  message: string;
}
export class SendMessageEvent extends BaseSocketEvent
  implements SendMessageEvent {
  constructor(
    public lobbyId: string,
    public userId: string,
    public message: string,
  ) {
    super(userId, "SendMessage");
  }
}
export const SendMessageEventBus = Evt.create<ISendMessageEvent>();
