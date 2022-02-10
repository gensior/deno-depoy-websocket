import User from "../Domain/User.ts";
import { Color } from "./Colors.ts";
import { IIdentifiable } from "./IIdentifiable.ts";

export class Player implements IIdentifiable {
    public user: User;
    public color: Color;

    constructor(user: User, color: Color) {
        this.user = user;
        this.color = color;
    }

    get id() {
        return this.user.id
    }
}