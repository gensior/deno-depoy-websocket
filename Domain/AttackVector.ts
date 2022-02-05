export class AttackVector {
  public origin: string;
  public target: string;
  public damage: number;
  public blocked: boolean;
  public readonly key: string;

  constructor(
    origin: string,
    target: string,
    damage: number,
    blocked: boolean,
  ) {
    this.origin = origin;
    this.target = target;
    this.damage = damage;
    this.blocked = blocked;
    this.key = `${origin}-${target}`;
  }
}
