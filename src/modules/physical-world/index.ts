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
import {
  define as defineAction,
  check as checkAction,
} from "../../core/actions";

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
    tags.character,
    "holding",
    RelationshipOrder.OneToOne,
    tags.carryable,
    "heldBy"
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

  holding: defineAction(
    tags.character,
    "hold",
    tags.touchable,
    undefined,
    checkHoldAction,
    carryOutHoldAction
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
};

function checkTakeAction(subject: Thing, noun?: Thing, secondNoun?: Thing) {
  if (!noun) {
    log(`${subject.name} cannot take nothing`);
    return false;
  }

  if (!noun.kinds.has(tags.carryable)) {
    log(`${noun.name} cannot be carried`);
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

function checkHoldAction(
  subject: Thing,
  noun?: Thing,
  secondNoun?: Thing
): boolean {
  if (!noun) {
    log(`${subject.name} cannot hold nothing`);
    return false;
  }
  if (findRelationship(subject, relationships.holding.type, { noun })) {
    log(`${subject.name} already holding ${noun.name}`);
    return false;
  }
  if (!findRelationship(subject, relationships.carrying.type, { noun })) {
    log(`${subject.name} cannot hold ${noun.name} without carrying it first`);
    return false;
  }
  checkAction("hold", subject, noun, secondNoun);
  return true;
}

function carryOutHoldAction(subject: Thing, noun?: Thing, secondNoun?: Thing) {
  if (noun) {
    makeRelationship(subject, relationships.holding, noun, log);
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
