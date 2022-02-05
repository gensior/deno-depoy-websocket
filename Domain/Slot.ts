import { Armor } from "./Armor.ts";

export class Slot {
  public key: string;
  public critical: boolean;
  public wounded: boolean;
  public armor: Armor | null = null;

  constructor(key: string, critical: boolean, wounded: boolean) {
    this.key = key;
    this.critical = critical;
    this.wounded = wounded;
  }

  public setArmor(armor: Armor): void {
    this.armor = armor;
  }

  public removeArmor(): void {
    this.armor = null;
  }

  public wound(): void {
    this.wounded = true;
  }

  public heal(): void {
    this.wounded = false;
  }
}
