import {
  UserController,
  UserControllerSingleton,
} from "./Controllers/UserController.ts";
import { Err, Result, serve } from "./deps.ts";
import User from "./Domain/User.ts";
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
const userController = UserControllerSingleton;

serve((req: Request) => {
  let connection: Connection;
  const upgrade = req.headers.get("upgrade") || "";
  if (upgrade.toLowerCase() != "websocket") {
    return new Response("request isn't trying to upgrade websocket.");
  }

  const userResult = loginUser(req, userController);

  let user: User;
  let err = "";
  userResult.match({
    ok: (x) => {
      user = x;
    },
    err: (e) => {
      err = e;
    },
  });
  if (err != "") {
    return new Response(err);
  }

  const { socket, response } = Deno.upgradeWebSocket(req, { idleTimeout: 30 });

  socket.onopen = () => {
    connection = switchboard.registerSocket(socket, user);
    socket.send(JSON.stringify({ connectionId: connection.id }));
  };
  socket.onmessage = (e) => {
    try {
      const json = JSON.parse(e.data);
      const message = new Message(
        connection.user,
        json.action,
        json.data || {},
      );
      listener.dispatch(message);
      // const message = new Message(json.action, connection.id, json.data);
      // switchboard.dispatch(message);
    } catch (e) {
      console.error(e);
    }
  };

  //@ts-ignore: this is ok
  socket.onerror = (e) => console.log("socket errored:", e.message);
  socket.onclose = () => {};

  return response;
});

const loginUser = (
  req: Request,
  controller: UserController,
): Result<User, string> => {
  const url = new URL(req.url);
  const userName = url.searchParams.get("name");
  const userId = url.searchParams.get("id");

  if (userId == null) {
    return Err("request must have an 'id' query parameter.");
  }
  if (userName == null) {
    return Err("request must have a 'name' query parameter.");
  }

  return controller.saveOrUpdate(userId, userName);
};

console.log("Server has started.");
