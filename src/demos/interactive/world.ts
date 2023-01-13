import { make as makeThing, Thing } from "../../core/things";
import * as PhysicalWorld from "../../modules/physical-world/index";
import getImage from "./get-image";

export type ObjectData = Thing & { image: string };

export type World = {
  things: Array<Thing>;
};

export async function init(localFilesPath: string): Promise<World> {
  const duck = makeThing("duck", [
    PhysicalWorld.tags.carryable,
    PhysicalWorld.tags.touchable,
    PhysicalWorld.tags.visible,
  ]);

  const goblin = makeThing("goblin", [
    PhysicalWorld.tags.carryable,
    PhysicalWorld.tags.visible,
    PhysicalWorld.tags.touchable,
  ]);

  const table = makeThing("table", [
    PhysicalWorld.tags.character,
    PhysicalWorld.tags.supporter,
    PhysicalWorld.tags.flammable,
    PhysicalWorld.tags.visible,
    PhysicalWorld.tags.touchable,
  ]);

  const box = makeThing("box", [
    PhysicalWorld.tags.supporter,
    PhysicalWorld.tags.container,
    PhysicalWorld.tags.flammable,
    PhysicalWorld.tags.visible,
    PhysicalWorld.tags.touchable,
  ]);

  const world = {
    things: await Promise.all(
      [duck, goblin, table, box].map(async (object) => {
        await getImage(object.name, localFilesPath);
        return object;
      })
    ),
  };
  return world;
}

export async function addThing(
  world: World,
  name: string,
  localFilesPath: string
) {
  await getImage(name, localFilesPath);
  // TODO: ask for appropriate tags based on name
  const thing = makeThing(name, []);
  if (world.things.every((t) => t.name !== thing.name)) {
    world.things.push(thing);
    return true;
  } else {
    return false;
  }
}

export function getValidActionsForThing(name: string) {
  return ["in", "on"];
}
