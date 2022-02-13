import { Evt } from "../deps.ts";

export interface ISocketEvent {
  userId: string;
}

// deno-lint-ignore no-empty-interface
export interface ICreateLobby extends ISocketEvent {
}

export interface ILobbyCreated {
  lobbyId: string;
  creatorId: string;
}

export interface IJoinLobby extends ISocketEvent {
  lobbyId: string;
}

export interface IJoinedLobby {
  lobbyId: string;
  playerId: string;
}

export interface ISendMessage extends ISocketEvent {
  lobbyId: string;
  message: string;
}

export interface ISentMessage {
  lobbyId: string;
  userId: string;
  message: string;
}

export class InternalEvents {
  public readonly CreateLobby = Evt.create<ICreateLobby>();
  public readonly LobbyCreated = Evt.create<ILobbyCreated>();

  public readonly JoinLobby = Evt.create<IJoinLobby>();
  public readonly JoinedLobby = Evt.create<IJoinedLobby>();
}

export const InternalEventsSingleton = new InternalEvents();
