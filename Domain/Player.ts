import { Result } from "../deps.ts";
import User from "../Domain/User.ts";
import { Color } from "./Colors.ts";
import { IIdentifiable } from "./IIdentifiable.ts";
import { Lobby } from "./Lobby.ts";

export class Player implements IIdentifiable {
  public user: User;
  public color: Color;
  public lobby: Lobby;

  constructor(user: User, color: Color, lobby: Lobby) {
    this.user = user;
    this.color = color;
    this.lobby = lobby;
    this.user.setPlayer(this);
  }

  get id() {
    return this.user.id;
  }

  get name() {
    return this.user.name;
  }

  public leaveLobby(): Result<Player, string> {
    return this.lobby.leaveLobby(this.id).map((_) => {
      return this;
    });
  }
}
