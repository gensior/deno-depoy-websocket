import { Err, Ok, randomString, Result } from "../deps.ts";
import { BaseDomain } from "./BaseDomain.ts";
import { Color, ColorPool } from "./Colors.ts";
import { Player } from "./Player.ts";
import User from "./User.ts";

const MAX_PLAYERS = 6;

export class Lobby extends BaseDomain {
  public readonly players: Map<string, Player>;
  private readonly colorPool: ColorPool;

  public static Create(creator: User): Lobby {
    const id = randomString.cryptoRandomString({
      length: 4,
      characters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    });
    return new Lobby(id, creator);
  }

  private constructor(id: string, creator: User) {
    super(id);
    this.colorPool = new ColorPool();
    this.players = new Map<string, Player>();

    this.events.LobbyCreated.post({ lobbyId: this.id, creatorId: creator.id });
  }

  public getPlayer(id: string): Result<Player, string> {
    const player = this.players.get(id);
    if (player) {
      return Ok(player);
    } else {
      return Err("Player could not be found in the lobby.");
    }
  }

  public availableColors(): Color[] {
    return [...this.colorPool.choices].sort();
  }

  public JoinLobby(user: User): Result<Player, string> {
    if (this.players.size < MAX_PLAYERS) {
      const colorOption = this.colorPool.pull();

      return colorOption.match({
        some: (x): Result<Player, string> => {
          const player = new Player(user, x, this);
          this.players.set(player.id, player);
          this.events.JoinedLobby.post({
            lobbyId: this.id,
            playerId: player.id,
          });
          return Ok(player);
        },
        none: (): Result<Player, string> =>
          Err("No colors available to assign to player."),
      });
    } else {
      return Err("Lobby is full.");
    }
  }

  public leaveLobby(id: string): Result<User, string> {
    if (this.players.has(id)) {
      const player = this.players.get(id)!;
      this.colorPool.put(player.color);
      if (this.players.delete(id)) {
        player.user.clearPlayer();
        return Ok(player.user);
      } else {
        return Err("Could not remove player from lobby.");
      }
    } else {
      return Err("Player not in lobby.");
    }
  }

  public destroy(): void {
    this.players.forEach((player) => {
      player.user.clearPlayer();
    });
  }

  public Notify(message: string): void {
    this.players.forEach((value) => {
      value.user.connection.match({
        some: (val) => val.websocket.send(message),
        none: () => {},
      });
    });
  }

  public Broadcast(message: string, sender: string): void {
    this.players.forEach((value, key) => {
      if (key != sender) {
        value.user.connection.match({
          some: (val) => val.websocket.send(message),
          none: () => {},
        });
      }
    });
  }
}
