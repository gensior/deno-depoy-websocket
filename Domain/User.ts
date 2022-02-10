import Connection from "../Switchboard/Connection.ts";
import { IIdentifiable } from "./IIdentifiable.ts";

export default class User implements IIdentifiable {
    public readonly id: string;
    public readonly connection: Connection;

    constructor(id: string, connection: Connection) {
        this.id = id;
        this.connection = connection;
    }
}