import { serve } from "./deps.ts"
import LobbyFactory from "./Factories/LobbyFactory.ts";
import LobbyHandler from "./Handlers/LobbyHandler.ts";
import { SocketHandler } from "./Handlers/SocketHandler.ts";
import { Message } from "./Message.ts";

const _lobbyFactory = LobbyFactory;
const _lobbyHandler = LobbyHandler;

serve((req: Request) => {

    const upgrade = req.headers.get("upgrade") || "";
    if (upgrade.toLowerCase() != "websocket") {
        return new Response("request isn't trying to upgrade websocket.");
    }

    // const url = new URL(req.url);
    // const user = url.searchParams.get("user");
    // if (user == null) {
    //     return new Response("request must have a 'user' query parameter.");
    // }

    const { socket, response } = Deno.upgradeWebSocket(req, { idleTimeout: 30 });
    const handler = new SocketHandler(socket);

    socket.onopen = () => {
        //connection = switchboard.registerSocket(socket);
    };
    socket.onmessage = (e) => {
        try {
            const json = JSON.parse(e.data);
            const message = new Message(json.action, json.data);
            handler.dispatch(message);
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