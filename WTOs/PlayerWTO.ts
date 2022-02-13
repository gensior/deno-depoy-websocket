import { Player } from "../Domain/Player.ts";

export class PlayerWTO {
  public static FromPlayer(player: Player): PlayerWTO {
    const connectionId = player.user.connection.match({
      some: (x) => x.id,
      none: () => "",
    });
    return new PlayerWTO(connectionId, player.name, player.color);
  }

  constructor(public id: string, public name: string, public color: string) {}
}
