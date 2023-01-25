import { make as makeThing, Thing } from "../../core/things";
import * as Actions from "../../core/actions";
import { get as getTag, Something } from "../../core/tags";
import { log } from "../../core/log";
import inferKinds from "./infer-kinds";
import { find as findRelationship } from "../../core/relationships";
import fs from "fs/promises";
import path from "path";
import { parse, stringify } from "flatted";

import * as PhysicalWorld from "../../modules/physical-world/index";
import getImage from "./get-image";

const user = makeThing("user", [
  PhysicalWorld.tags.character,
  PhysicalWorld.tags.visible,
  PhysicalWorld.tags.touchable,
]);

const dbPath = path.join(__dirname, "db.json");

export { Thing };

export type ObjectData = Thing & { image: string };

export type World = {
  things: Array<Thing>;
  userInventory: Array<string>;
};

export async function init(localFilesPath: string): Promise<World> {
  let { things, userInventory } = await loadThings();
  if (!things.length) {
    userInventory = [];

    const duck = makeThing("duck", [
      PhysicalWorld.tags.character,
      PhysicalWorld.tags.carryable,
      PhysicalWorld.tags.touchable,
      PhysicalWorld.tags.visible,
    ]);

    const goblin = makeThing("goblin", [
      PhysicalWorld.tags.character,
      PhysicalWorld.tags.carryable,
      PhysicalWorld.tags.touchable,
      PhysicalWorld.tags.visible,
    ]);

    const table = makeThing("table", [
      PhysicalWorld.tags.supporter,
      PhysicalWorld.tags.flammable,
      PhysicalWorld.tags.touchable,
      PhysicalWorld.tags.visible,
    ]);

    const box = makeThing("box", [
      PhysicalWorld.tags.supporter,
      PhysicalWorld.tags.container,
      PhysicalWorld.tags.flammable,
      PhysicalWorld.tags.touchable,
      PhysicalWorld.tags.visible,
    ]);

    things = await Promise.all(
      [duck, goblin, table, box].map(async (object) => {
        await getImage(object.name, localFilesPath);
        return object;
      })
    );

    await saveThings(things, []);
  }
  return { things, userInventory };
}

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
    saveThings(world.things, world.userInventory);

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
  return Object.values(PhysicalWorld.actions)
    .filter((action) => {
      const viable = Actions.checkTheoretical(action, user, firstThing);
      return viable;
    })
    .map((action) => ({
      name: action.name,
      expectsSecondThing: !!action.secondObjectTag,
    }));
}

export function getViableSecondThingsFor(
  world: World,
  thingName: string,
  actionName: string
) {
  const action = Object.values(PhysicalWorld.actions).find(
    (action) => action.name === actionName
  );
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
  const action = Object.values(PhysicalWorld.actions).find(
    (action) => action.name === actionName
  );
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
        PhysicalWorld.relationships.carriedBy.type,
        {
          object: user,
        }
      );
    })
    .map((t) => t.name);

  return success;
}

async function loadThings() {
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
    return { things: [], userInventory: [] };
  }
}

async function saveThings(things: Thing[], userInventory: string[]) {
  const dbText = stringify(
    { things, userInventory },
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
