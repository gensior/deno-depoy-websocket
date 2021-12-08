import { serve } from "https://deno.land/std@0.117.0/http/server.ts";

//@ts-ignore: this is ok
serve((req) => {
  const upgrade = req.headers.get("upgrade") || "";
  if (upgrade.toLowerCase() != "websocket") {
    return new Response("request isn't trying to upgrade websocket.");
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  const url = new URL(req.url);
  const user = url.searchParams.get("user");
  if (user == null) {
    return new Response("request must have a 'user' query parameter.");
  }

  console.log({ user });
  socket.onopen = () => processUser(user, socket);
  socket.onmessage = (e) => {
    console.log("socket message:", e.data);
    socket.send(new Date().toString());
  };
  //@ts-ignore: this is ok
  socket.onerror = (e) => console.log("socket errored:", e.message);
  socket.onclose = () => console.log("socket closed");
  return response;
});

console.log("Listening on http://localhost:8000");

const processUser = (user: string, socket: WebSocket) => {
  console.log(user);
  console.log("socket opened");
  socket.send(`Hello ${user}!`);
};
