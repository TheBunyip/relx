import React from "react";

import World from "./components/world";
import Actions from "./components/actions";
import Inventory from "./components/inventory";
import Alert from "./components/alert";

const ws = new WebSocket(`ws://${location.host}`);

export default function App() {
  const [world, setWorld] = React.useState({
    things: [],
    userInventory: [],
  });

  const [alertMsg, setAlertMsg] = React.useState({
    text: undefined,
    type: undefined,
  });

  const [selection, setSelection] = React.useState({
    thing: undefined,
    action: undefined,
    secondThing: undefined,
    viableActions: [],
    viableSecondThings: [],
  });

  ws.onopen = () => {
    console.log("Websocket connected");

    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data);

      if (payload.world) {
        console.log(payload.world);

        setWorld(payload.world);
      }

      if (payload.msg) {
        setAlertMsg({ text: payload.msg, type: payload.actionResult });
      }
    };
  };

  return (
    <div>
      <World world={world} selection={selection} setSelection={setSelection} />
      <Actions
        world={world}
        selection={selection}
        setSelection={setSelection}
      />
      <Inventory
        world={world}
        selection={selection}
        setSelection={setSelection}
      />
      <Alert alert={alertMsg} setAlert={setAlertMsg} />
    </div>
  );
}

export async function onThingSelected(name, world, selection, setSelection) {
  // are we selecting the first or second object here?
  if (selection.action) {
    // fire off an action on the server
    attemptAction(selection.thing, selection.action.name, name, setSelection);
  } else {
    const selectedThing = world.things.find((thing) => thing.name === name);
    console.log("Selected", JSON.stringify(selectedThing));
    setSelection((prevSelection) => ({
      ...prevSelection,
      thing: selectedThing?.name,
    }));

    // check which actions are now viable
    const response = await fetch(`/viable-actions/${name}`);
    const actions = await response.json();
    console.log("Viable actions", JSON.stringify(actions));
    setSelection((prevSelection) => ({
      ...prevSelection,
      viableActions: actions,
    }));
  }
}

export async function onActionSelected(action, world, selection, setSelection) {
  if (action.expectsSecondThing) {
    setSelection((prevSelection) => ({ ...prevSelection, action: action }));

    // check which secondary objects are now viable
    const response = await fetch(
      `/viable-second-things/${selection.thing}/${action.name}`
    );
    const secondThings = await response.json();
    console.log("Viable second things", JSON.stringify(secondThings));
    setSelection((prevSelection) => ({
      ...prevSelection,
      viableSecondThings: secondThings,
    }));
  } else {
    attemptAction(selection.thing, action.name, undefined, setSelection);
  }
}

async function attemptAction(thing, action, secondThing, setSelection) {
  console.log("Attempting action...");
  fetch("/attempt-action/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      firstThing: thing,
      action: action,
      secondThing: secondThing,
    }),
  });

  setSelection({
    thing: undefined,
    action: undefined,
    viableActions: [],
    viableSecondThings: [],
  });
}
