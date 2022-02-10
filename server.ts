import { serve } from "./deps.ts"
import { EmitterSingleton } from "./Emitter.ts";
import { LobbyHandlerSingleton } from "./Handlers/LobbyHandler.ts";
import { ListenerSingleton } from "./Listener.ts";
import { Message } from "./Message.ts";
import Connection from "./Switchboard/Connection.ts";
import { SwitchboardSingleton } from "./Switchboard/Switchboard.ts";

const _emitter = EmitterSingleton;
const listener = ListenerSingleton;
const switchboard = SwitchboardSingleton;
const _lobbyHandler = LobbyHandlerSingleton;

serve((req: Request) => {
    let connection : Connection;
    const upgrade = req.headers.get("upgrade") || "";
    if (upgrade.toLowerCase() != "websocket") {
        return new Response("request isn't trying to upgrade websocket.");
    }

    const url = new URL(req.url);
    const userId = url.searchParams.get("user");
    if (userId == null) {
        return new Response("request must have a 'user' query parameter.");
    }

    const { socket, response } = Deno.upgradeWebSocket(req, { idleTimeout: 30 });

    socket.onopen = () => {
        connection = switchboard.registerSocket(socket);
    };
    socket.onmessage = (e) => {
        try {
            const json = JSON.parse(e.data);
            const message = new Message(connection.id, json.action, json.data || {});
            listener.dispatch(message);
            // const message = new Message(json.action, connection.id, json.data);
            // switchboard.dispatch(message);
        } catch (e) {
            console.error(e);
        }
    };
    
    //@ts-ignore: this is ok
    socket.onerror = (e) => console.log("socket errored:", e.message);
    socket.onclose = () => { };
    
    return response;
})

console.log("Server has started.");