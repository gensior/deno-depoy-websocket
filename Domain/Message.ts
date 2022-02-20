import { Lobby } from "./Lobby.ts";
import { Player } from "./Player.ts";

export class Message {
  public static Create(player: Player, text: string): Message {
    return new Message(player, text);
  }

  private constructor(
    public player: Player,
    public text: string,
  ) {}

  get name(): string {
    return this.player.name;
  }

  get color(): string {
    return this.player.color;
  }

  get lobby(): Lobby {
    return this.player.lobby;
  }
}
