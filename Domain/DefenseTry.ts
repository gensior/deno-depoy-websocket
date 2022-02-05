export class DefenseTry {
  public slot: string;
  public hand: string;
  public value: number;

  constructor(hand: string, slot: string, value: number) {
    this.slot = slot;
    this.hand = hand;
    this.value = value;
  }
}
