import { Thing, removeRelationship } from "../core/things";
import { log } from "../core/log";
import {
  make as makeRelationship,
  test as testRelationship,
  Relationship,
} from "../core/relationships";
import {
  defineAction,
  execute as executeAction,
  defaultCheck,
} from "../core/actions";
import { insteadOf, before } from "../core/rules";
import { relationships, tags } from "../modules/physical-world/index";
import * as Circumstances from "../core/circumstances";
import { Something } from "../core/tags";
import gazetteer from "./gazetteer";

// define some basic actions
const taking = defineAction(
  tags.human,
  "take",
  tags.touchable,
  undefined,
  undefined,
  carryOutTakeAction
);
const holding = defineAction(
  tags.human,
  "hold",
  tags.touchable,
  undefined,
  checkHoldAction,
  carryOutHoldAction
);
const dropping = defineAction(
  tags.human,
  "drop",
  Something,
  undefined,
  checkDropAction,
  carryOutDropAction
);

// define some unusual situations
//const bobTakingTable = Circumstances.inAction(gazetteer.bob, taking, gazetteer.table).build();
const bobTakingTable = Circumstances.when(gazetteer.bob)
  .is(taking)
  .the(gazetteer.table)
  .build();
before(bobTakingTable, gruntingHappens);
insteadOf(bobTakingTable, tableTooHeavy);

// const bobTakingSomethingWhileHolding = Circumstances.inAction(gazetteer.bob, taking, tags.carryable)
//     .withState({ subject: gazetteer.bob, action: holding, tag: Something })
//     .build();
const bobTakingSomethingWhileHolding = Circumstances.when(gazetteer.bob)
  .is(taking)
  .a(Something)
  .and(
    Circumstances.when(gazetteer.bob)
      .already(relationships.holding)
      .a(Something)
      .build()
  )
  .build();
insteadOf(bobTakingSomethingWhileHolding, cannotPickUpWhenHolding);

// perform some actions
(function () {
  executeAction(gazetteer.bob, holding, gazetteer.rope);

  executeAction(gazetteer.bob, taking, gazetteer.rope);
  executeAction(gazetteer.bob, taking, gazetteer.table);

  executeAction(gazetteer.bob, holding, gazetteer.rope);
  executeAction(gazetteer.bob, holding, gazetteer.rope);

  executeAction(gazetteer.bob, taking, gazetteer.candle);

  executeAction(gazetteer.bob, dropping, gazetteer.candle);
  executeAction(gazetteer.bob, dropping, gazetteer.rope);
  executeAction(gazetteer.bob, taking, gazetteer.candle);
})();

function gruntingHappens(subject: Thing, noun?: Thing, secondNoun?: Thing) {
  log(`${subject.name} grunts...`);
  return true;
}

function tableTooHeavy(
  subject: Thing,
  noun?: Thing,
  secondNoun?: Thing
): boolean {
  log(`The table is too heavy for ${subject.name} to carry`);
  return false;
}

function cannotPickUpWhenHolding(
  subject: Thing,
  noun?: Thing,
  secondNoun?: Thing
): boolean {
  if (noun) {
    log(`${subject.name} cannot pick up ${noun.name} while holding something`);
  }
  return false;
}

function carryOutTakeAction(subject: Thing, noun?: Thing, secondNoun?: Thing) {
  if (noun) {
    makeRelationship(
      subject,
      relationships.carrying,
      noun,
      onRelationshipEstablished,
      onRelationError
    );
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
  if (testRelationship(subject, relationships.holding.type, { noun })) {
    log(`${subject.name} already holding ${noun.name}`);
    return false;
  }
  if (!testRelationship(subject, relationships.carrying.type, { noun })) {
    log(`${subject.name} cannot hold ${noun.name} without carrying it first`);
    return false;
  }
  defaultCheck("hold", subject, noun, secondNoun);
  return true;
}

function carryOutHoldAction(subject: Thing, noun?: Thing, secondNoun?: Thing) {
  if (noun) {
    makeRelationship(
      subject,
      relationships.holding,
      noun,
      onRelationshipEstablished,
      onRelationError
    );
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
  if (!testRelationship(subject, relationships.carrying.type, { noun })) {
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

function onRelationshipEstablished(subject: Thing, relationship: Relationship) {
  log(
    `Relationship established: ${subject.name} is ${relationship.type.description} ${relationship.otherThing.name}`
  );
}

function onRelationError(err: string) {
  log(err);
}
