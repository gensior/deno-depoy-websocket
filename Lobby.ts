import { IIdentifiable } from "./IIdentifiable.ts";

export class Lobby implements IIdentifiable {
    public readonly id: string;

    constructor(id: string) {
        this.id = id;
    }
}