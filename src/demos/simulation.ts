import process from "process";
import readline from "readline";

/**
 * Set up a world and then simulate actions occurring in it, reporting on the
 * changing state of the world as we go. The actions that different subjects
 * take in the world is randomised across the set of actions that they *could*
 * take. Initially this is picked from all actions, but later I'll pick from
 * a shortlist of actions that are possible (which could be determined by
 * explicitly invoking a version of Action execute that does every step up to,
 * but not including, the carrying-out part.
 */

// make some things for our simulation

// make some actions that can happen every turn
// NOTE: every turn is a rulebook?  Need to check how Inform does it

const SIMULATION_STEP_RATE = 2000;
let paused = false;

function stepSimulation() {
  // for each object that can act, choose an action and perform it
  console.log("--- THE WORLD TURNS ---");
}

// start the simulation
let timer = setInterval(stepSimulation, SIMULATION_STEP_RATE);

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

process.stdin.on("keypress", (str, key) => {
  if (key.name === "x") {
    process.exit();
  } else if (key.name === " ") {
    paused = !paused;
    if (paused) {
      clearInterval(timer);
    } else {
      timer = setInterval(stepSimulation, SIMULATION_STEP_RATE);
    }
  } else {
    console.log(`You pressed the "${key.key}" key`);
    console.log(key);
  }
});
