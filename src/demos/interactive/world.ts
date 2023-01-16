import { make as makeThing, Thing } from "../../core/things";
import * as Actions from "../../core/actions";
import { get as getTag } from "../../core/tags";
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

export type ObjectData = Thing & { image: string };

export type World = {
  things: Array<Thing>;
  userInventory: Array<string>;
};

export async function init(localFilesPath: string): Promise<World> {
  let { things, userInventory } = await loadThings(localFilesPath);
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

    await saveThings(things, [], localFilesPath);
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
    saveThings(world.things, world.userInventory, localFilesPath);
    return true;
  } else {
    return false;
  }
}

export function getPossibleActions(name: string) {
  // all the actions we want to allow the user to try
  return Object.values(PhysicalWorld.actions).map((action) => {
    return {
      name: action.name,
      expectsSecondThing: !!action.secondNoun,
    };
  });
}

export function attemptAction(
  world: World,
  firstThingName: string,
  actionName: string,
  secondThingName?: string
) {
  const action = Object.values(PhysicalWorld.actions).find(
    (a) => a.name === actionName
  );
  if (!action) {
    throw new Error(`Unknown action: ${actionName}`);
  }
  const firstThing = world.things.find((t) => t.name === firstThingName);
  if (!firstThing) {
    throw new Error(`Unknown first thing: ${firstThingName}`);
  }
  let secondThing;
  if (action.secondNoun) {
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
          noun: user,
        }
      );
    })
    .map((t) => t.name);

  return success;
}

async function loadThings(localFilesPath: string) {
  try {
    const dbText = await fs.readFile(path.join(localFilesPath, "db.json"), {
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

async function saveThings(
  things: Thing[],
  userInventory: string[],
  localFilesPath: string
) {
  const dbText = stringify(
    { things, userInventory },
    function replacer(key, value) {
      if (value instanceof Set && key === "kinds") {
        const modifiedValue = [...value].map((s) => s.description);
        console.log("Replacing set with", modifiedValue);
        return modifiedValue;
      } else {
        return value;
      }
    }
    // 2
  );
  try {
    await fs.writeFile(path.join(localFilesPath, "db.json"), dbText, {
      encoding: "utf8",
    });
  } catch (err) {
    console.error("Failed to save world DB to disk", err);
  }
}
