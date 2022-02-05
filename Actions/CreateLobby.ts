import { Request } from "../deps.ts";

export interface ICreateLobby {
  name: string;
  user: string;
}

export class CreateLobby extends Request {
  constructor(public name: string = "", public user: string = "") {
    super();
  }
}
