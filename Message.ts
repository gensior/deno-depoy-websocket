export class Message {
    public time: number;

    // deno-lint-ignore no-explicit-any
    constructor(public action: string, public clientId: string, public data: any) {
        this.time = new Date().getTime();
    }
}