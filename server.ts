import { createContainer, injectable, serve, token } from "./deps.ts";
import Websocket from "./services/Websocket.ts";
import WebsocketBus from "./services/WebsocketBus.ts";
import Connection from "./Switchboard/Connection.ts";
import Switchboard from "./Switchboard/Switchboard.ts";

const TOKENS = {
  Switchboard: token<Switchboard>("Switchboard token"),
  Websocket: token<Websocket>("Websocket token"),
  WebsocketBus: token<WebsocketBus>("Websocket Bus token"),
};

const switchboard = new Switchboard();

//@ts-ignore: this is ok
serve((req) => {
  let connection: Connection;
  const upgrade = req.headers.get("upgrade") || "";
  if (upgrade.toLowerCase() != "websocket") {
    return new Response("request isn't trying to upgrade websocket.");
  }

  const url = new URL(req.url);
  const user = url.searchParams.get("user");
  if (user == null) {
    return new Response("request must have a 'user' query parameter.");
  }

  const container = createContainer();
  const { socket, response } = Deno.upgradeWebSocket(req);

  container.bindValue(TOKENS.Websocket, new Websocket(socket));
  container.bindValue(TOKENS.Switchboard, switchboard);
  container.bindFactory(
    TOKENS.WebsocketBus,
    injectable(
      (websocket: Websocket) => new WebsocketBus(websocket),
      TOKENS.Websocket,
    ),
    { scope: "scoped" },
  );

  socket.onopen = () => {
    connection = switchboard.registerSocket(socket);
  };
  socket.onmessage = (e) => {
    console.log({ e });
    console.log("socket message:", e.data);
    const bus = container.resolve<WebsocketBus>(TOKENS.WebsocketBus);
    if (e.data === "connections") {
      bus.send(switchboard.getSocketIds().length);
    } else {
      bus.send(new Date().toString());
    }
  };

  //@ts-ignore: this is ok
  socket.onerror = (e) => console.log("socket errored:", e.message);
  socket.onclose = () => {
    console.log("socket closed");
    switchboard.disconnectSocket(connection);
    container.removeAll();
  };

  return response;
});

console.log("Listening on http://localhost:8000");
