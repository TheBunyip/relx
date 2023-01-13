/** Provides an interface to allow a user to interact with a virtual, physical world. */

import express from "express";
import path from "path";
import http from "http";
import * as WebSocket from "ws";

import * as World from "./world";

const port = 3000;

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

/** Decode JSON data */

app.use(express.json());

const locaFilesPath =
  process.env.PUBLIC_PATH ?? path.join(__dirname, "./public");

World.init(locaFilesPath).then((world) => {
  console.log("Serving from", locaFilesPath);
  app.use(express.static(locaFilesPath));

  app.get("/world", (req, res) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(world));
  });

  app.get("/valid-actions-for-thing/:thing", (req, res) => {
    const actions = World.getValidActionsForThing(req.params.thing);
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(actions));
  });

  app.post("/add-object", (req, res) => {
    console.log("Client wants to add an object called", req.body);
    World.addThing(world, req.body.name, locaFilesPath).then((added) => {
      if (added) {
        refreshClients(world);
      }
    });
    res.statusCode = 200;
    res.end();
  });

  app.post("/attempt-action", (req, res) => {
    const { firstNoun, action, secondNoun } = req.body;
    console.log(`Client wants ${firstNoun} ${action} ${secondNoun}`);
    res.statusCode = 200;
    res.end();
  });

  console.log(`Listening on port ${port}`);
  server.listen(port);
});

wss.on("connection", (ws) => {
  console.log("Client connected");
});

function refreshClients(world: any) {
  wss.clients.forEach((client) => {
    client.send(
      JSON.stringify({
        world,
      })
    );
  });
}
