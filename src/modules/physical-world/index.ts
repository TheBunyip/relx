import { log } from "../../core/log";
import { get as getTag, Something } from "../../core/tags";
import { Thing, removeRelationship } from "../../core/things";
import {
  define as defineRelationship,
  make as makeRelationship,
  exists as relationshipExists,
  allowed as relationshipAllowed,
  RelationshipOrder,
} from "../../core/relationships";
import { define, check } from "../../core/actions";

// tags relating to the physical world
export const tags = {
  long: getTag("long"),
  strong: getTag("strong"),
  thin: getTag("thin"),
  flammable: getTag("flammable"),
  lightable: getTag("lightable"),
  carryable: getTag("carryable"),
  supporter: getTag("supporter"),
  character: getTag("character"),
  container: getTag("container"),
  visible: getTag("visible"),
  touchable: getTag("touchable"),
};

// define some relationship types
export const relationships = {
  carrying: defineRelationship(
    tags.character,
    "carrying",
    RelationshipOrder.OneToMany,
    tags.carryable,
    "carried by"
  ),
  holding: defineRelationship(
    tags.character,
    "holding",
    RelationshipOrder.OneToOne,
    tags.carryable,
    "held by"
  ),
  supporting: defineRelationship(
    tags.supporter,
    "supporting",
    RelationshipOrder.OneToMany,
    tags.carryable,
    "supported by"
  ),
  containing: defineRelationship(
    tags.container,
    "containing",
    RelationshipOrder.OneToMany,
    Something,
    "contained by"
  ),
  viewing: defineRelationship(
    tags.visible,
    "viewing",
    RelationshipOrder.ManyToMany,
    tags.character,
    "viewed by"
  ),
  touching: defineRelationship(
    tags.character,
    "touching",
    RelationshipOrder.ManyToMany,
    tags.touchable,
    "touched by"
  ),
};

export const actions = {
  // define some basic actions
  taking: define(
    tags.character,
    "take",
    tags.touchable,
    undefined,
    checkTakeAction,
    carryOutTakeAction
  ),

  holding: define(
    tags.character,
    "hold",
    tags.touchable,
    undefined,
    checkHoldAction,
    carryOutHoldAction
  ),

  dropping: define(
    tags.character,
    "drop",
    Something,
    undefined,
    checkDropAction,
    carryOutDropAction
  ),
};

function checkTakeAction(subject: Thing, noun?: Thing, secondNoun?: Thing) {
  if (!noun) {
    log(`${subject.name} cannot take nothing`);
    return false;
  }

  // if (relationshipExists(subject, relationships.carrying.type, { noun })) {
  //   log(`${subject.name} already has ${noun.name}`);
  //   return false;
  // }

  if (!noun.kinds.has(tags.carryable)) {
    log(`${noun.name} cannot be carried`);
    return false;
  }

  return relationshipAllowed(subject, relationships.carrying, noun, log);
  // });
  // if (carriedBy) {
  //   if (carriedBy.otherThing.name === subject.name) {
  //     log(`${subject.name} already has ${noun.name}`);
  //   } else {
  //     log(`${carriedBy.otherThing.name} already has ${noun.name}`);
  //   }
  //   return false;
  // }

  // return true;
}

function carryOutTakeAction(subject: Thing, noun?: Thing, secondNoun?: Thing) {
  if (noun) {
    makeRelationship(subject, relationships.carrying, noun, log);
    return true;
  } else {
    return false;
  }
}

function checkHoldAction(
  subject: Thing,
  noun?: Thing,
  secondNoun?: Thing
): boolean {
  if (!noun) {
    log(`${subject.name} cannot hold nothing`);
    return false;
  }
  if (relationshipExists(subject, relationships.holding.type, { noun })) {
    log(`${subject.name} already holding ${noun.name}`);
    return false;
  }
  if (!relationshipExists(subject, relationships.carrying.type, { noun })) {
    log(`${subject.name} cannot hold ${noun.name} without carrying it first`);
    return false;
  }
  check("hold", subject, noun, secondNoun);
  return true;
}

function carryOutHoldAction(subject: Thing, noun?: Thing, secondNoun?: Thing) {
  if (noun) {
    makeRelationship(subject, relationships.holding, noun, log);
    return true;
  } else {
    return false;
  }
}

function checkDropAction(
  subject: Thing,
  noun?: Thing,
  secondNoun?: Thing
): boolean {
  if (!noun) {
    log(`${subject.name} cannot drop nothing`);
    return false;
  }
  if (!relationshipExists(subject, relationships.carrying.type, { noun })) {
    log(`${subject.name} cannot drop ${noun.name} without carrying it first`);
    return false;
  }
  return true;
}

function carryOutDropAction(subject: Thing, noun?: Thing, secondNoun?: Thing) {
  if (noun) {
    removeRelationship(subject, relationships.carrying, noun);
    return true;
  } else {
    return false;
  }
}
