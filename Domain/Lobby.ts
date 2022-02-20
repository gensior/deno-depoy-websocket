import { Err, None, Ok, Option, randomString, Result, Some } from "../deps.ts";
import { BaseDomain } from "./BaseDomain.ts";
import { Color, ColorPool } from "./Colors.ts";
import { Message } from "./Message.ts";
import { Player } from "./Player.ts";
import User from "./User.ts";

const MAX_PLAYERS = 6;

export class Lobby extends BaseDomain {
  public static Create(): Lobby {
    const id = randomString.cryptoRandomString({
      length: 4,
      characters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    });
    return new Lobby(id);
  }

  private constructor(
    id: string,
    public readonly players: Map<string, Player> = new Map<string, Player>(),
    private readonly colorPool: ColorPool = new ColorPool(),
    public readonly messages: Message[] = [],
    private admin: Option<Player> = None,
  ) {
    super(id);
  }

  public getPlayer(id: string): Result<Player, string> {
    const player = this.players.get(id);
    if (player) {
      return Ok(player);
    } else {
      return Err("Player could not be found in the lobby.");
    }
  }

  public getAdmin(): Option<Player> {
    if (!this.players.size) return None;
    const value = this.players.values().next().value;

    if (value) {
      return Some(value as Player);
    } else {
      return None;
    }
  }

  public availableColors(): Color[] {
    return [...this.colorPool.choices].sort();
  }

  public JoinLobby(user: User): Result<Lobby, string> {
    if (this.players.size < MAX_PLAYERS) {
      const colorOption = this.colorPool.pull();

      return colorOption.match({
        some: (x): Result<Lobby, string> => {
          const player = new Player(user, x, this);
          this.players.set(player.id, player);
          return Ok(this);
        },
        none: (): Result<Lobby, string> =>
          Err("No colors available to assign to player."),
      });
    } else {
      return Err("Lobby is full.");
    }
  }

  public AddMessage(message: Message): void {
  }

  public leaveLobby(player: Player): Result<Lobby, string> {
    if (this.players.has(player.id)) {
      this.colorPool.put(player.color);
      if (this.players.delete(player.id)) {
        player.user.clearPlayer();
        return Ok(this);
      } else {
        console.error("Could not remove player from lobby");
        return Err("Could not remove player from lobby.");
      }
    } else {
      console.error("Player not in lobby.");
      return Err("Player not in lobby.");
    }
  }

  public destroy(): void {
    this.players.forEach((player) => {
      player.user.clearPlayer();
    });
  }
}
