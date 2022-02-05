import { Request } from "../deps.ts";
export class SendMessage extends Request {
  constructor(public message: string) {
    super();
  }
}
