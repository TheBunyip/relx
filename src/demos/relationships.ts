import { Tag, get as getTag } from "../core/tags";
import {
  Thing,
  describe as describeThing,
  test as testThing,
} from "../core/things";
import { log } from "../core/log";
import {
  describeDefinition as describeRelationshipDefinition,
  make as makeRelationship,
  find as findRelationship,
} from "../core/relationships";
import { relationshipsByName } from "../core/index";
import gazetteer from "./gazetteer";

// create some concrete relationships
(function () {
  const error = (err: string) => log(err, "!!!");

  // create some concrete relationships
  // these could be made and unmade over time
  makeRelationship(
    gazetteer.table,
    relationshipsByName.get("supporting")!,
    gazetteer.candle,
    error
  );
  makeRelationship(
    gazetteer.bob,
    relationshipsByName.get("holding")!,
    gazetteer.rope,
    error
  );
  makeRelationship(
    gazetteer.sue,
    relationshipsByName.get("holding")!,
    gazetteer.rope,
    error
  );
  makeRelationship(
    gazetteer.box,
    relationshipsByName.get("containing")!,
    gazetteer.bob,
    error
  );
  makeRelationship(
    gazetteer.bob,
    relationshipsByName.get("containing")!,
    gazetteer.box,
    error
  );
  makeRelationship(
    gazetteer.bob,
    relationshipsByName.get("viewing")!,
    gazetteer.sue,

    error
  );
})();

console.log("");
console.log("########################################################");
log("Here are some types of thing that exist in the world..");

Object.values(gazetteer).forEach((thing) => {
  log(describeThing(thing));
});
console.log("########################################################");

console.log("");
console.log("########################################################");
log("Here are some relationships between types of thing..");

relationshipsByName.forEach((relationship) => {
  log(describeRelationshipDefinition(relationship));
});
console.log("########################################################");

console.log("");
console.log("########################################################");
log("Here are true facts about the current world..");

// run some tests
(function () {
  const isTagged = (thing: Thing, tag: Tag) => {
    log(
      `${thing.name} is${testThing(thing, tag) ? "" : " NOT"} ${
        tag.description
      }`
    );
  };

  const isRelated = (subject: Thing, rel: string, object: Thing) => {
    log(
      `${subject.name} is${
        findRelationship(subject, getTag(rel), { object: object }) ? "" : " NOT"
      } ${rel} ${object.name}`
    );
  };

  isTagged(gazetteer.rope, getTag("touchable")!);
  isTagged(gazetteer.bob, getTag("flammable"));

  isRelated(gazetteer.bob, "carrying", gazetteer.sun);
  isRelated(gazetteer.bob, "carrying", gazetteer.rope);
  isRelated(gazetteer.sue, "carrying", gazetteer.rope);
  isRelated(gazetteer.rope, "carrying", gazetteer.bob);
  isRelated(gazetteer.rope, "carried by", gazetteer.bob);
})();
console.log("########################################################");
