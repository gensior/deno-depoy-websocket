// deno-lint-ignore-file no-explicit-any
import User from "./Domain/User.ts";

export class SocketMessage {
  public time: number;

  constructor(
    public connId: string,
    public user: User,
    public action: string,
    public data: any,
  ) {
    this.time = new Date().getTime();
  }
}
