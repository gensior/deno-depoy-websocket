import {
  createContainer,
  injectable,
  Mediator,
  None,
  serve,
  token,
} from "./deps.ts";
import { ActionHandler } from "./Handlers/ActionHandler.ts";
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
    (mediator: Mediator) => new ActionHandler(mediator),
    TOKENS.Mediator,
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

const games: { [key: string]: Game } = {};

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
        const data = JSON.parse(e.data);
        bus.send(switchboard.dispatch(data));
        //const method = data.method.toLowerCase();

        // A user wants to create a new game
        if (data.method === "create") {
          const gameId = crypto.randomUUID();
          // Add the game to the game hashmap
          games[gameId] = {
            "id": gameId,
            "balls": 20,
            "clients": [],
            "state": {},
          };

          // A payload to send back to the client
          const payLoad = {
            "method": "create",
            "game": games[gameId], // the game state
          };

          // Get the connection from the hashmap of clients
          const connectionOption = switchboard.getSocket(connection.id);
          connectionOption.match({
            some: (con) => con.websocket.send(JSON.stringify(payLoad)),
            none: () => console.error(`Connection ${connection.id} not found`),
          });
        }

        // A user wants to join
        if (data.method === "join") {
          const gameId = data.gameId;
          const game = games[gameId];
          if (game.clients.length >= 3) {
            // sorry, max players reached
            return;
          }
          const color = {
            "0": "Red",
            "1": "Green",
            "2": "Blue",
          }[game.clients.length]!;
          game.clients.push({ "clientId": connection.id, "color": color });

          /// start the game
          // if (game.clients.length === 3) updateGameState();

          const payLoad = {
            "method": "join",
            "game:": game,
          };

          // loop through all clients and tell them that people have joined
          game.clients.forEach((c) => {
            switchboard.getSocket(c.clientId).andThen((con) => {
              con.websocket.send(JSON.stringify(payLoad));
              return None;
            });
          });
        }

        // a user plays a move
        if (data.method === "play") {
          const gameId = data.gameId;
          const ballId = data.ballId;
          const color = data.color;
          let state = games[gameId].state;
          if (!state) state = {};

          state[ballId] = color;
          games[gameId].state = state;

          updateGameState(gameId);
        }

        if (data.action == "joinChannel") {
          switchboard.joinChannel(data.channel, connection);
        }

        const payload = {
          "method": "connect",
          "clientId": connection.id,
        };

        //connection.websocket.send(JSON.stringify(payload));
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

function updateGameState(gameId: string): void {
  const game = games[gameId];
  const payload = {
    "method": "update",
    "game": game,
  };

  game.clients.forEach((c) => {
    switchboard.getSocket(c.clientId).andThen((con) => {
      con.websocket.send(JSON.stringify(payload));
      return None;
    });
  });
}

console.log("Listening on http://localhost:8000");
