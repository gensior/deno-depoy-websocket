import { Err, Ok, randomString, Result } from "../deps.ts";
import {
  CreateLobbyAction,
  IAction,
  ISendMessageAction,
} from "../Events/InternalActions.ts";
import { BaseDomain } from "./BaseDomain.ts";
import { Color, ColorPool } from "./Colors.ts";
import { Message } from "./Message.ts";
import { Player } from "./Player.ts";
import User from "./User.ts";

const MAX_PLAYERS = 6;

export class Lobby extends BaseDomain {
  public readonly players: Map<string, Player>;
  private readonly colorPool: ColorPool;
  public readonly actions: IAction[];
  public readonly messages: Message[];

  public static Create(): Lobby {
    const id = randomString.cryptoRandomString({
      length: 4,
      characters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    });
    return new Lobby(id);
  }

  private constructor(id: string) {
    super(id);
    this.colorPool = new ColorPool();
    this.actions = [new CreateLobbyAction()];
    this.players = new Map<string, Player>();
    this.messages = [];
  }

  public Do(action: IAction): void {
    this.actions.push(action);
    switch (action.type) {
      case "JoinLobby": {
        // const a = action as unknown as IJoinLobbyAction
        // this.JoinLobby(a.user);
        break;
      }
      case "SendMessage": {
        //const a = action as unknown as ISendMessageAction

        break;
      }
      default: {
        break;
      }
    }
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
          return Ok(player);
        },
        none: (): Result<Player, string> =>
          Err("No colors available to assign to player."),
      });
    } else {
      return Err("Lobby is full.");
    }
  }

  public AddMessage(message: Message): void {
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
}
