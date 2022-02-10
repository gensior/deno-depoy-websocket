import { Option,Some,None } from "../deps.ts";

export type Color = "red" | "blue" | "green" | "yellow" | "orange" | "purple";

export class ColorPool {
    public choices!: Color[];

    constructor() {
        this.reset();
    }

    pull() : Option<Color> {
        if (this.choices.length) {
            return Some(this.choices.pop()!)
        } else {
            return None;
        }
    }

    put(color: Color) : void {
        this.choices.push(color);
        this.shuffle();
    }

    reset() : void {
        this.choices = ["red", "blue", "green", "yellow", "orange", "purple"];
        this.shuffle();
    }

    // https://stackoverflow.com/a/2450976
    shuffle() {
        let currentIndex = this.choices.length,  randomIndex;
      
        // While there remain elements to shuffle...
        while (currentIndex != 0) {
      
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
        
            // And swap it with the current element.
            [this.choices[currentIndex], this.choices[randomIndex]] = [this.choices[randomIndex], this.choices[currentIndex]];
        }
    }
}