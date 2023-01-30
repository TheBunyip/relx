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
const tags = {
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
const relationships = {
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

const actions = {
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

function checkTakeAction(subject: Thing, object?: Thing, secondObject?: Thing) {
  if (!object) {
    log(`${subject.name} cannot take nothing`);
    return false;
  }

  if (!object.kinds.has(tags.carryable)) {
    log(`${object.name} is not carryable`);
    return false;
  }

  return relationshipAllowed(subject, relationships.carrying, object, log);
}

function carryOutTakeAction(
  subject: Thing,
  object?: Thing,
  secondObject?: Thing
) {
  if (object) {
    removeRelationship(object, relationships.supportedBy);
    makeRelationship(subject, relationships.carrying, object, log);
  }
}

function checkDropAction(
  subject: Thing,
  object?: Thing,
  secondObject?: Thing
): boolean {
  if (!object) {
    log(`${subject.name} cannot drop nothing`);
    return false;
  }
  if (
    !findRelationship(subject, relationships.carrying.type, { object: object })
  ) {
    log(`${subject.name} cannot drop ${object.name} without carrying it first`);
    return false;
  }
  return true;
}

function carryOutDropAction(
  subject: Thing,
  object?: Thing,
  secondObject?: Thing
) {
  if (object) {
    removeRelationship(subject, relationships.carrying, object);
  }
}

function checkPutOntoAction(
  subject: Thing,
  object?: Thing,
  secondObject?: Thing
) {
  if (!object) {
    log(`${subject.name} cannot put nothing onto anything`);
    return false;
  }

  if (!secondObject) {
    log(`${subject.name} cannot put ${object.name} onto nothing`);
    return false;
  }

  if (
    !findRelationship(subject, relationships.carrying.type, { object: object })
  ) {
    log(
      `${subject.name} cannot put ${object.name} onto ${secondObject.name} without carrying it first`
    );
    return false;
  }

  return true;
}

function carryOutPutOntoAction(
  subject: Thing,
  object?: Thing,
  secondObject?: Thing
) {
  if (object && secondObject) {
    removeRelationship(subject, relationships.carrying, object);
    makeRelationship(secondObject, relationships.supporting, object);
  }
}

function checkPutIntoAction(
  subject: Thing,
  object?: Thing,
  secondObject?: Thing
) {
  if (!object) {
    log(`${subject.name} cannot put nothing into anything`);
    return false;
  }

  if (!secondObject) {
    log(`${subject.name} cannot put ${object.name} into nothing`);
    return false;
  }

  if (
    !findRelationship(subject, relationships.carrying.type, { object: object })
  ) {
    log(
      `${subject.name} cannot put ${object.name} into ${secondObject.name} without carrying it first`
    );
    return false;
  }

  return true;
}

function carryOutPutIntoAction(
  subject: Thing,
  object?: Thing,
  secondObject?: Thing
) {
  if (object && secondObject) {
    removeRelationship(subject, relationships.carrying, object);
    makeRelationship(secondObject, relationships.containing, object);
  }
}

const extension = {
  name: "PhysicalWorld",
  description: "Defines physical interactions between objects",
  tags: Object.values(tags),
  actions: Object.values(actions),
  relationships: Object.values(relationships),
};
export default extension;
