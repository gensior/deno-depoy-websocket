export class Message {
    public time: number;

    // deno-lint-ignore no-explicit-any
    constructor(public connectionId: string, public action: string, public data: any) {
        this.time = new Date().getTime();
    }
}