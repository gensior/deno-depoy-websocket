import {
  createContainer,
  injectable,
  Mediator,
  serve,
  token,
} from "./deps.ts";
import { ActionHandler } from "./Handlers/ActionHandler.ts";
import { Message } from "./Message.ts";
import Websocket from "./services/Websocket.ts";
import WebsocketBus from "./services/WebsocketBus.ts";
import Connection from "./Switchboard/Connection.ts";
import { Dispatcher } from "./Switchboard/Dispatcher.ts";
import Switchboard from "./Switchboard/Switchboard.ts";

const TOKENS = {
  Dispatcher: token<Dispatcher>("Dispatcher token"),
  Switchboard: token<Switchboard>("Switchboard token"),
  Websocket: token<Websocket>("Websocket token"),
  WebsocketBus: token<WebsocketBus>("Websocket Bus token"),
  Mediator: token<Mediator>("Mediator token."),
  ActionHandler: token<ActionHandler>("ActionHandler token"),
};

const mainContainer = createContainer();
mainContainer.bindValue(
  TOKENS.Mediator,
  new Mediator(),
);
mainContainer.bindValue(TOKENS.Dispatcher, new Dispatcher());
mainContainer.bindFactory(
  TOKENS.ActionHandler,
  injectable(
    (mediator: Mediator, switchboard: Switchboard) => new ActionHandler(mediator, switchboard),
    TOKENS.Mediator,
    TOKENS.Switchboard
  ),
);
mainContainer.bindFactory(
  TOKENS.Switchboard,
  injectable(
    (dispatcher: Dispatcher, mediator: Mediator) =>
      new Switchboard(dispatcher, mediator),
    TOKENS.Dispatcher,
    TOKENS.Mediator,
  ),
);
const switchboard = mainContainer.resolve(TOKENS.Switchboard);
const _actionHandler = mainContainer.resolve(TOKENS.ActionHandler);
type Client = {
  clientId: string;
  color: string;
};
type Game = {
  id: string;
  balls: number;
  state: { [key: string]: string };
  clients: Client[];
};

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

  const container = createContainer(mainContainer);
  const { socket, response } = Deno.upgradeWebSocket(req, { idleTimeout: 30 });

  container.bindValue(TOKENS.Websocket, new Websocket(socket));
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
    const bus = container.resolve<WebsocketBus>(TOKENS.WebsocketBus);
    if (e.data === "connections") {
      bus.send(switchboard.getSocketIds().length);
    } else if (e.data === "channels") {
      bus.send(switchboard.listChannels());
    } else {
      try {
        const json = JSON.parse(e.data);
        const message = new Message(json.action, connection.id, json.data);
        switchboard.dispatch(message);
      } catch (e) {
        console.error(e);
      }
    }
  };

  //@ts-ignore: this is ok
  socket.onerror = (e) => console.log("socket errored:", e.message);
  socket.onclose = () => {
    switchboard.disconnectSocket(connection);
    container.removeAll();
  };

  return response;
});

console.log("Listening on http://localhost:8000");
