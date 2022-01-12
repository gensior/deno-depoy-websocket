const http = require("http");
const app = require("express")();
app.get("/", (req,res)=> res.sendFile(__dirname + "/index.html"))

app.listen(9091, ()=>console.log("Listening on http port 9091"))
import { server as websocketServer } from "websocket";
const httpServer = createServer();
httpServer.listen(9090, () => console.log("Listening.. on 9090"))
//hashmap clients
const clients = {};
const games = {};

const wsServer = new websocketServer({
    "httpServer": httpServer
})

wsServer.on("request", request => {
  //connect
  const connection = request.accept(null, request.origin);
  connection.on("open", () => console.log("opened!"))
  connection.on("close", () => console.log("closed!"))

  connection.on("message", message => {
    const result = JSON.parse(message.utf8Data)
    // I have received a messge from the client

    // A user wants to create a new game
    if (result.method === "create") {
      const clientId = result.clientId;
      const gameId = guid();
      // Add the game to the game hashmap
      games[gameId] = {
        "id": gameId,
        "balls": 20,
        "clients": []
      }

      // A payload to send back to the client
      const payLoad = {
        "method": "create",
        "game": games[gameId] // the game state
      }

      // Get the connection from the hashmap of clients
      const con = clients[clientId].connection; // but where is this saved?
      con.send(JSON.stringify(payLoad))
    }
  })
})