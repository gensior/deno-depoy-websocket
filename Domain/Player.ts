import { Body } from "./Body.ts";
import { Hands } from "./Hands.ts";

export class Player {
  public userId: string;
  public name: string;
  public body: Body;
  public health: number;
  public hands: Hands;

  constructor(userId: string, name: string) {
    this.userId = userId;
    this.name = name;
    this.body = new Body();
    this.hands = new Hands();
    this.health = 3;
  }
}
