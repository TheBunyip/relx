/** Provides an interface to allow a user to interact with a virtual, physical world. */

import express from "express";
import path from "path";
import http from "http";
import * as WebSocket from "ws";

import * as Log from "../../core/log";
import * as World from "./world";

const port = 3000;

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

/** Decode JSON data */

app.use(express.json());

const localFilesPath =
  process.env.PUBLIC_PATH ?? path.join(__dirname, "./public");

console.log("Serving from", localFilesPath);

World.init(localFilesPath).then((world) => {
  console.log("Serving from", localFilesPath);
  app.use(express.static(localFilesPath));

  Log.setLog((str: string, prefix?: string) => {
    const msg = `${prefix ?? ""} ${str}`;
    // wss.clients.forEach((client) => {
    //   client.send(JSON.stringify({ msg }));
    // });
    console.log(msg);
  });

  app.get("/viable-actions/:thing", (req, res) => {
    const actions = World.getViableActionsFor(world, req.params.thing);
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    console.log(`Sending actions '${JSON.stringify(actions)}' to client`);
    res.send(JSON.stringify(actions));
  });

  app.get("/viable-second-things/:thing/:action", (req, res) => {
    const actions = World.getViableSecondThingsFor(
      world,
      req.params.thing,
      req.params.action
    );
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(actions));
  });

  app.post("/add-object", (req, res) => {
    console.log("Client wants to add an object called", req.body);
    World.addThing(world, req.body.name, localFilesPath).then((added) => {
      if (added) {
        refreshClients(world);
      }
    });
    res.statusCode = 200;
    res.end();
  });

  app.get("image");

  app.post("/attempt-action", (req, res) => {
    const { firstThing, action, secondThing } = req.body;
    console.log(`Client wants ${firstThing} ${action} ${secondThing ?? ""}`);
    const actionSuccessful = World.attemptAction(
      world,
      firstThing,
      action,
      secondThing
    );
    if (actionSuccessful) {
      const clientWorld = getClientWorld(world);
      wss.clients.forEach((client) => {
        client.send(JSON.stringify({ actionResult: true, world: clientWorld }));
      });
    } else {
      wss.clients.forEach((client) => {
        client.send(JSON.stringify({ actionResult: false }));
      });
    }
    res.statusCode = 200;
    res.end();
  });

  wss.on("connection", (ws) => {
    console.log("Client connected");
    ws.send(JSON.stringify({ world: getClientWorld(world) }));
  });

  console.log(`Listening on port ${port}`);
  server.listen(port);
});

function refreshClients(world: World.World) {
  const msg = JSON.stringify({ world: getClientWorld(world) });

  wss.clients.forEach((client) => {
    client.send(msg);
  });
}

function getClientWorld(world: World.World) {
  return {
    things: world.things.map((t: World.Thing) => {
      return {
        name: t.name,
      };
    }),
    userInventory: world.userInventory,
  };
}
