import { None, Option, Some } from "../deps.ts";
import Connection from "../Switchboard/Connection.ts";
import { IIdentifiable } from "./IIdentifiable.ts";
import { Player } from "./Player.ts";

export default class User implements IIdentifiable {
  public readonly id: string;
  public name: string;
  public connection: Option<Connection>;
  public player: Option<Player>;

  public static Hydrate(id: string, name: string): User {
    return new User(id, name);
  }

  public static Create(name: string): User {
    const id = crypto.randomUUID();
    return new User(id, name);
  }

  private constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.player = None;
    this.connection = None;
  }

  public setPlayer(player: Player): void {
    this.player = Some(player);
  }

  public clearPlayer(): void {
    this.player = None;
  }

  public isPlaying(): boolean {
    return this.player.isSome();
  }

  public setConnection(connection: Connection): void {
    this.connection = Some(connection);
  }

  public clearConnection(): void {
    this.connection = None;
  }

  public isConnected(): boolean {
    return this.connection.isSome();
  }
}
