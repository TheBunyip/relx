import process from "process";
import readline from "readline";
import "colors";
/**
 * Set up a world and then simulate actions occurring in it, reporting on the
 * changing state of the world as we go. The actions that different subjects
 * take in the world is randomised across the set of actions that they *could*
 * take. Initially this is picked from all actions, but later I'll pick from
 * a shortlist of actions that are possible (which could be determined by
 * explicitly invoking a version of Action execute that does every step up to,
 * but not including, the carrying-out part.
 */

import { execute as executeAction } from "../core/actions";
import { make as makeThing } from "../core/things";
import { pickOneFrom } from "../core/utils";
import * as PhysicalWorld from "../modules/physical-world/index";

// THINGS IN THE WORLD
// characters
const characters = [
  makeThing("Avriel", [PhysicalWorld.tags.character]),
  makeThing("Sundu Mor", [PhysicalWorld.tags.character]),
  makeThing("Kaylee Bruckton", [PhysicalWorld.tags.character]),
  makeThing("The Cavalier", [PhysicalWorld.tags.character]),
  ...Array.from(Array(10), (e: Element, i: number) => {
    return makeThing(`Clockwork Soldier ${i + 1}`, [
      PhysicalWorld.tags.character,
    ]);
  }),
];
// objects
const objects = [
  makeThing("sandstone block", [
    PhysicalWorld.tags.carryable,
    PhysicalWorld.tags.supporter,
    PhysicalWorld.tags.touchable,
    PhysicalWorld.tags.visible,
    PhysicalWorld.tags.touchable,
  ]),
];

// ACTIONS

const SIMULATION_STEP_RATE = 2000;
let paused = false;

function stepSimulation() {
  // for each object that can act, choose an action and perform it
  const subject = pickOneFrom(characters);
  const attemptedAction = pickOneFrom(Object.values(PhysicalWorld.actions));
  const otherObject = pickOneFrom([null, ...objects]);
  console.log("#", subject.name, "takes action...");
  if (executeAction(subject, attemptedAction, otherObject)) {
    console.log("  ...succeeded");
  }

  console.log("--- THE WORLD TURNS ---".dim);
}

// start the simulation
let timer = setInterval(stepSimulation, SIMULATION_STEP_RATE);

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

process.stdin.on("keypress", (str, key) => {
  if (key.name === "x" || (key.ctrl && key.name === "c")) {
    process.exit();
  } else if (key.name === "p") {
    paused = !paused;
    if (paused) {
      console.log("--- PAUSED ---".red);
      clearInterval(timer);
    } else {
      timer = setInterval(stepSimulation, SIMULATION_STEP_RATE);
    }
  } else {
    console.log("Press 'x' to stop the simulation or 'p' to pause it");
  }
});
