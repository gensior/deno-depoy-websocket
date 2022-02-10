import { InternalEvents,InternalEventsSingleton } from "../Events/InternalEvents.ts";
import IEventable from "./IEventable.ts";
import { IIdentifiable } from "./IIdentifiable.ts";

export abstract class BaseDomain implements IIdentifiable, IEventable {
    id: string;
    events: InternalEvents;

    constructor(id: string, events: InternalEvents = InternalEventsSingleton) {
        this.id = id;
        this.events = events;
    }

}