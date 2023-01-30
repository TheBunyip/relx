import { make as makeThing, Thing } from "../../core/things";
import * as Actions from "../../core/actions";
import {
  actionsByName,
  relationshipsByName,
  extensions,
} from "../../core/index";
import { get as getTag, Something } from "../../core/tags";
import { log } from "../../core/log";
import inferKinds from "./infer-kinds";
import { find as findRelationship } from "../../core/relationships";
import fs from "fs/promises";
import path from "path";
import { parse, stringify } from "flatted";
import getImage from "./get-image";

import {
  Extension,
  register as registerExtension,
} from "../../core/extensions";
import PhysicalWorldModule from "../../extensions/physical-world";

const user = makeThing("user", [
  getTag("character"),
  getTag("visible"),
  getTag("touchable"),
]);

const dbPath = path.join(__dirname, "db.json");

export { Thing };

export type ObjectData = Thing & { image: string };

export type World = {
  things: Array<Thing>;
  userInventory: Array<string>;
  extensions: { extension: Extension; enabled: boolean }[];
};

export async function addThing(
  world: World,
  name: string,
  localFilesPath: string
) {
  if (world.things.some((t) => t.name === name)) {
    log(`Did not add ${name} since there already was one in the world`);
    return;
  }

  const [dummy, rawKinds] = await Promise.all([
    getImage(name, localFilesPath),
    inferKinds(name),
  ]);

  console.log(`OpenAI says that ${name} is ${rawKinds.join(",")}`);

  const kinds = rawKinds
    .map((k) => k.trim().replace(/\s/, "").toLowerCase())
    .filter((k) => k.length > 0);

  const thing = makeThing(
    name,
    kinds.map((k) => getTag(k))
  );
  if (world.things.every((t) => t.name !== thing.name)) {
    world.things.push(thing);
    save(world);

    return true;
  } else {
    return false;
  }
}

export function getViableActionsFor(world: World, thingName: string) {
  const firstThing = world.things.find((thing) => thing.name === thingName);
  if (!firstThing) {
    log(`Unrecognised object ${thingName}`);
    return [];
  }

  // all the actions we want to allow the user to try
  const viableActions: Actions.Action[] = [];
  actionsByName.forEach((action, actionName) => {
    if (Actions.checkTheoretical(action, user, firstThing)) {
      viableActions.push(action);
    }
  });

  return viableActions.map((action) => ({
    name: action.name,
    expectsSecondThing: !!action.secondObjectTag,
  }));
}

export function getViableSecondThingsFor(
  world: World,
  thingName: string,
  actionName: string
) {
  const action = actionsByName.get(actionName);
  if (!action) {
    log(`Unrecognised action ${actionName}`);
    return [];
  }

  const firstThing = world.things.find((thing) => thing.name === thingName);
  if (!firstThing) {
    log(`Unrecognised object ${thingName} for action ${actionName}`);
    return [];
  }

  return world.things
    .filter((secondThing) => {
      // check if this could be a viable second thing
      const viable = Actions.check(action, user, firstThing, secondThing);
      return viable;
    })
    .map((thing) => thing.name);
}

export function attemptAction(
  world: World,
  firstThingName: string,
  actionName: string,
  secondThingName?: string
) {
  const action = actionsByName.get(actionName);
  if (!action) {
    throw new Error(`Unknown action: ${actionName}`);
  }
  const firstThing = world.things.find((t) => t.name === firstThingName);
  if (!firstThing) {
    throw new Error(`Unknown first thing: ${firstThingName}`);
  }
  let secondThing;
  if (action.secondObjectTag) {
    secondThing = world.things.find((t) => t.name === secondThingName);
    if (!secondThing) {
      throw new Error(`Unknown second thing: ${secondThingName}`);
    }
  }
  const success = Actions.execute(user, action, firstThing, secondThing);

  // recalculate inventory
  world.userInventory = world.things
    .filter((thing) => {
      return findRelationship(
        thing,
        relationshipsByName.get("carriedBy")!.type,
        {
          object: user,
        }
      );
    })
    .map((t) => t.name);

  return success;
}

export async function load(): Promise<World> {
  try {
    const dbText = await fs.readFile(dbPath, {
      encoding: "utf8",
    });

    return parse(dbText, function reviver(key, value) {
      if (Array.isArray(value) && key === "kinds") {
        return new Set(value.map((k) => getTag(k)));
      } else {
        return value;
      }
    });
  } catch {
    const newWorld: World = {
      things: [],
      userInventory: [],
      extensions: [{ extension: PhysicalWorldModule, enabled: false }],
    };
    save(newWorld);
    return newWorld;
  }
}

async function save(world: World) {
  const dbText = stringify(
    {
      things: world.things,
      userInventory: world.userInventory,
      extensions: world.extensions,
    },
    function replacer(key, value) {
      if (value instanceof Set && key === "kinds") {
        const modifiedValue = [...value].map((s) => s.description);
        //console.log("Replacing set with", modifiedValue);
        return modifiedValue;
      } else {
        return value;
      }
    }
  );
  try {
    await fs.writeFile(dbPath, dbText, { encoding: "utf8" });
  } catch (err) {
    console.error("Failed to save world DB to disk", err);
  }
}
