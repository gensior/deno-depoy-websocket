import { AttackTry } from "./AttackTry.ts";
import { AttackVector } from "./AttackVector.ts";
import { DefenseTry } from "./DefenseTry.ts";
import { Player } from "./Player.ts";

type CombatMove = {
  attack: AttackTry[];
  defend: DefenseTry[];
  shield: [
    { slot: string },
  ];
};

type CombatRound = {
  agressorMoves: CombatMove[];
  defenderMoves: CombatMove[];
  aggressorResults: AttackVector[];
  defenderResults: AttackVector[];
};

export class Combat {
  public playerA: Player;
  public playerB: Player;
  public rounds: CombatRound[];

  constructor(playerA: Player, playerB: Player) {
    this.playerA = playerA;
    this.playerB = playerB;
    this.rounds = [];
  }

  // public PlayTurn(
  //   playerAMoves: CombatMove,
  //   playerBMoves: CombatMove,
  // ): CombatRound {
  //   const result = {
  //     agressorMoves: playerAMoves,
  //     defenderMoves: playerBMoves,
  //     aggressorResults: [],
  //     defenderResults: [],
  //   };
  //   const agressorResults = this.calculateDamage();
  // }

  public calculateDamage(
    attack: CombatMove,
    defender: Player,
    defense: CombatMove,
  ): AttackVector[] {
    const result: AttackVector[] = [];
    // loop through attacker's attacks
    attack.attack.forEach((a) => {
      const origin = a.hand;
      const target = a.slot;
      let blocked = false;
      // see if defender is shielding slot
      defense.shield.forEach((s) => {
        blocked = true;
        if (target === s.slot) {
          result.push(new AttackVector(origin, target, 0, true));
        }
      });
      // calculate unblocked defense vs attack
      if (!blocked) {
        let defenseValue = 0;
        const armor = defender.body[target].armor;
        if (armor === "wood") {
          defenseValue += 1;
        } else if (armor === "iron") {
          defenseValue += 2;
        }

        defense.defend.forEach((d) => {
          if (target === d.slot) {
            defenseValue += d.value;
          }
        });

        const damage = a.value - defenseValue;

        if (damage > 0) {
          result.push(new AttackVector(origin, target, damage, false));
        } else {
          result.push(new AttackVector(origin, target, 0, false));
        }
      }
    });

    return result;
  }
}
