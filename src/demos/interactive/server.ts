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

World.init(localFilesPath).then((world) => {
  console.log("Serving from", localFilesPath);
  app.use(express.static(localFilesPath));

  Log.setLog((str: string, prefix?: string) => {
    const msg = `${prefix ?? ""} ${str}`;
    wss.clients.forEach((client) => {
      client.send(JSON.stringify({ msg }));
    });
  });

  app.get("/world", (req, res) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    const transformedWorld = {
      things: world.things.map((t) => {
        return {
          name: t.name,
        };
      }),
    };
    res.send(JSON.stringify(transformedWorld));
  });

  app.get("/possible-actions/:thing", (req, res) => {
    const actions = World.getPossibleActions(req.params.thing);
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

  app.post("/attempt-action", (req, res) => {
    const { firstThing, action, secondThing } = req.body;
    console.log(`Client wants ${firstThing} ${action} ${secondThing ?? ""}`);
    World.attemptAction(world, firstThing, action, secondThing);
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
  const msg = JSON.stringify({
    world,
  });

  wss.clients.forEach((client) => {
    client.send(msg);
  });
}
