import { Thing, removeRelationship } from "../core/things";
import { log } from "../core/log";
import { execute as executeAction } from "../core/actions";
import { insteadOf, before } from "../core/rules";
import { relationships, actions } from "../modules/physical-world/index";
import * as Circumstances from "../core/circumstances";
import { Something } from "../core/tags";
import gazetteer from "./gazetteer";

// define some unusual situations
//const bobTakingTable = Circumstances.inAction(gazetteer.bob, taking, gazetteer.table).build();
const bobTakingTable = Circumstances.when(gazetteer.bob)
  .is(actions.taking)
  .the(gazetteer.table)
  .build();
before(bobTakingTable, gruntingHappens);
insteadOf(bobTakingTable, tableTooHeavy);

// const bobTakingSomethingWhileHolding = Circumstances.inAction(gazetteer.bob, taking, tags.carryable)
//     .withState({ subject: gazetteer.bob, action: holding, tag: Something })
//     .build();
const bobTakingSomethingWhileHolding = Circumstances.when(gazetteer.bob)
  .is(actions.taking)
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
  executeAction(gazetteer.bob, actions.taking, gazetteer.rope);
  executeAction(gazetteer.bob, actions.taking, gazetteer.table);

  executeAction(gazetteer.bob, actions.taking, gazetteer.rope);

  executeAction(gazetteer.bob, actions.taking, gazetteer.candle);

  executeAction(gazetteer.bob, actions.dropping, gazetteer.candle);
  executeAction(gazetteer.bob, actions.dropping, gazetteer.rope);
  executeAction(gazetteer.bob, actions.taking, gazetteer.candle);
})();

function gruntingHappens(subject: Thing, object?: Thing, secondObject?: Thing) {
  log(`${subject.name} grunts...`);
  return true;
}

function tableTooHeavy(
  subject: Thing,
  object?: Thing,
  secondObject?: Thing
): boolean {
  log(`The table is too heavy for ${subject.name} to carry`);
  return false;
}

function cannotPickUpWhenHolding(
  subject: Thing,
  object?: Thing,
  secondObject?: Thing
): boolean {
  if (object) {
    log(
      `${subject.name} cannot pick up ${object.name} while holding something`
    );
  }
  return false;
}
