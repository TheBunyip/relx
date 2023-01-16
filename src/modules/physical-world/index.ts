import { log } from "../../core/log";
import { get as getTag, Something } from "../../core/tags";
import { Thing, removeRelationship } from "../../core/things";
import {
  define as defineRelationship,
  make as makeRelationship,
  find as findRelationship,
  allowed as relationshipAllowed,
  RelationshipOrder,
} from "../../core/relationships";
import { define as defineAction } from "../../core/actions";

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
  ...defineRelationship(
    tags.character,
    "carrying",
    RelationshipOrder.OneToMany,
    tags.carryable,
    "carriedBy"
  ),
  ...defineRelationship(
    tags.supporter,
    "supporting",
    RelationshipOrder.OneToMany,
    tags.carryable,
    "supportedBy"
  ),
  ...defineRelationship(
    tags.container,
    "containing",
    RelationshipOrder.OneToMany,
    Something,
    "containedBy"
  ),
  ...defineRelationship(
    tags.visible,
    "viewing",
    RelationshipOrder.ManyToMany,
    tags.character,
    "viewedBy"
  ),
  ...defineRelationship(
    tags.character,
    "touching",
    RelationshipOrder.ManyToMany,
    tags.touchable,
    "touchedBy"
  ),
};

export const actions = {
  // define some basic actions
  taking: defineAction(
    tags.character,
    "take",
    tags.touchable,
    undefined,
    checkTakeAction,
    carryOutTakeAction
  ),

  dropping: defineAction(
    tags.character,
    "drop",
    Something,
    undefined,
    checkDropAction,
    carryOutDropAction
  ),

  puttingOnto: defineAction(
    tags.character,
    "put onto",
    tags.carryable,
    tags.supporter,
    checkPutOntoAction,
    carryOutPutOntoAction
  ),

  puttingInto: defineAction(
    tags.character,
    "put into",
    tags.carryable,
    tags.container,
    checkPutIntoAction,
    carryOutPutIntoAction
  ),
};

function checkTakeAction(subject: Thing, noun?: Thing, secondNoun?: Thing) {
  if (!noun) {
    log(`${subject.name} cannot take nothing`);
    return false;
  }

  if (!noun.kinds.has(tags.carryable)) {
    log(`${noun.name} is not carryable`);
    return false;
  }

  return relationshipAllowed(subject, relationships.carrying, noun, log);
}

function carryOutTakeAction(subject: Thing, noun?: Thing, secondNoun?: Thing) {
  if (noun) {
    removeRelationship(noun, relationships.supportedBy);
    makeRelationship(subject, relationships.carrying, noun, log);
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
  if (!findRelationship(subject, relationships.carrying.type, { noun })) {
    log(`${subject.name} cannot drop ${noun.name} without carrying it first`);
    return false;
  }
  return true;
}

function carryOutDropAction(subject: Thing, noun?: Thing, secondNoun?: Thing) {
  if (noun) {
    removeRelationship(subject, relationships.carrying, noun);
  }
}

function checkPutOntoAction(subject: Thing, noun?: Thing, secondNoun?: Thing) {
  if (!noun) {
    log(`${subject.name} cannot put nothing onto anything`);
    return false;
  }

  if (!secondNoun) {
    log(`${subject.name} cannot put ${noun.name} onto nothing`);
    return false;
  }

  if (!findRelationship(subject, relationships.carrying.type, { noun })) {
    log(
      `${subject.name} cannot put ${noun.name} onto ${secondNoun.name} without carrying it first`
    );
    return false;
  }

  return true;
}

function carryOutPutOntoAction(
  subject: Thing,
  noun?: Thing,
  secondNoun?: Thing
) {
  if (noun && secondNoun) {
    removeRelationship(subject, relationships.carrying, noun);
    makeRelationship(secondNoun, relationships.supporting, noun);
  }
}

function checkPutIntoAction(subject: Thing, noun?: Thing, secondNoun?: Thing) {
  if (!noun) {
    log(`${subject.name} cannot put nothing into anything`);
    return false;
  }

  if (!secondNoun) {
    log(`${subject.name} cannot put ${noun.name} into nothing`);
    return false;
  }

  if (!findRelationship(subject, relationships.carrying.type, { noun })) {
    log(
      `${subject.name} cannot put ${noun.name} into ${secondNoun.name} without carrying it first`
    );
    return false;
  }

  return true;
}

function carryOutPutIntoAction(
  subject: Thing,
  noun?: Thing,
  secondNoun?: Thing
) {
  if (noun && secondNoun) {
    removeRelationship(subject, relationships.carrying, noun);
    makeRelationship(secondNoun, relationships.containing, noun);
  }
}
