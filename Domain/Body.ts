import { Slot } from "./Slot.ts";

export class Body {
  public head: Slot;
  public torso: Slot;
  public leftArm: Slot;
  public rightArm: Slot;
  public leftLeg: Slot;
  public rightLeg: Slot;

  constructor() {
    this.head = new Slot("head", true, false);
    this.torso = new Slot("torso", true, false);
    this.leftArm = new Slot("leftArm", false, false);
    this.rightArm = new Slot("rightArm", false, false);
    this.leftLeg = new Slot("leftLeg", false, false);
    this.rightLeg = new Slot("rightLeg", false, false);
  }

  [key: string]: Slot
}
