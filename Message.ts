import User from "./Domain/User.ts";

export class Message {
  public time: number;

  // deno-lint-ignore no-explicit-any
  constructor(public user: User, public action: string, public data: any) {
    this.time = new Date().getTime();
  }
}
