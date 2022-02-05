export class AttackTry {
  public slot: string;
  public value: number;
  public hand: string;

  constructor(hand: string, slot: string, value: number) {
    this.hand = hand;
    this.slot = slot;
    this.value = value;
  }
}
