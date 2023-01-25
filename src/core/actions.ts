import { Tag } from "./tags";
import { Thing, Anything, test as testThing } from "./things";
import {
  Instructions,
  FailableInstructions,
  rulebooks,
  appliesTo as ruleAppliesTo,
} from "./rules";
import { log } from "./log";

export type Action = {
  // represents a character's intention to do something
  name: string;

  subjectTag: Tag;

  objectTag?: Tag;
  secondObjectTag?: Tag;

  check: FailableInstructions;
  carryOut: Instructions;
  report: Instructions;
};

export function define(
  subjectTag: Tag,
  name: string,
  objectTag?: Tag,
  secondObjectTag?: Tag,
  onCheck?: FailableInstructions,
  onCarryOut?: Instructions,
  onReport?: Instructions
): Action {
  return {
    name,
    subjectTag: subjectTag,
    objectTag: objectTag,
    secondObjectTag: secondObjectTag,
    check: onCheck || (() => true),
    carryOut: onCarryOut || carryOut.bind(null, name),
    report: onReport || report.bind(null, name),
  };
}

export function execute(
  subject: Thing,
  action: Action,
  object?: Thing,
  secondObject?: Thing
): boolean {
  // pass basic reasonability checks (e.g. the object exists)
  for (const rule of rulebooks.before) {
    if (ruleAppliesTo(rule, action, subject, object, secondObject)) {
      if (!rule.instructions(subject, object, secondObject)) {
        return false;
      }
    }
  }

  // these are usually to handle unusual situations in which this action
  // could be invoked
  for (const rule of rulebooks.instead) {
    if (ruleAppliesTo(rule, action, subject, object, secondObject)) {
      if (!rule.instructions(subject, object, secondObject)) {
        return false;
      }
    }
  }

  // a mundane rule that checks the action is valid
  // e.g. make sure you're not trying to take something you're already carrying
  if (!check(action, subject, object, secondObject)) {
    return false;
  }

  // a mundane rule that carries out the action in a standard way
  // e.g. move an item into a character's inventory
  action.carryOut(subject, object, secondObject);

  // these are usually to handle unusual situations in which this action
  // could be invoked
  for (const rule of rulebooks.after) {
    if (ruleAppliesTo(rule, action, subject, object, secondObject)) {
      rule.instructions(subject, object, secondObject);
    }
  }

  // a mundane rule that gives a standard report of the action's outcome
  // e.g. "You took the rope"
  action.report(subject, object, secondObject);
  return true;
}

export function check(
  action: Action,
  subject: Thing,
  object?: Thing,
  secondObject?: Thing
): boolean {
  log(
    `Checking action '${action.name}' (subject: ${subject.name}, object: ${
      object ? object.name : "none"
    }, secondObject: ${
      secondObject ? secondObject.name : "none"
    }) can take place.`
  );

  // perform basic checks on the kinds of subject, object and secondObject
  if (!testThing(subject, action.subjectTag)) {
    log(
      `The action '${action.name}' cannot be performed by '${subject.name}'.`
    );
    return false;
  }
  if (action.objectTag && (!object || !testThing(object, action.objectTag))) {
    log(
      `The action '${action.name}' cannot be performed on '${
        object ? object.name : "nothing"
      }'.`
    );
    return false;
  }
  if (
    action.secondObjectTag &&
    (!secondObject || !testThing(secondObject, action.secondObjectTag))
  ) {
    log(
      `The action '${action.name}' cannot be performed on '${
        secondObject ? secondObject.name : "nothing"
      }'.`
    );
    return false;
  }

  // perform any custom checks defined for this action
  return action.check(subject, object, secondObject);
}

export function carryOut(
  action: string,
  subject: Thing,
  object?: Thing,
  secondObject?: Thing
): boolean {
  log(
    `Action '${action}' (with subject: ${subject.name}, object: ${
      object ? object.name : "none"
    }, secondObject: ${secondObject ? secondObject.name : "none"})
    has no logic when carried out (is this really intentional?).`
  );
  return true;
}

export function report(
  action: string,
  subject: Thing,
  object?: Thing,
  secondObject?: Thing
): boolean {
  log(
    `Successfully carried out action '${action}' (with subject: ${
      subject.name
    }, object: ${object ? object.name : "none"}, secondObject: ${
      secondObject ? secondObject.name : "none"
    }).`
  );
  return true;
}

export function checkTheoretical(
  action: Action,
  subject: Thing,
  object?: Thing
): boolean {
  log(
    `Checking action '${action.name}' (subject: ${subject.name}, object: ${
      object ? object.name : "none"
    }) could theoretically take place.`
  );

  // perform basic checks on the kinds of subject, object and secondObject
  if (!testThing(subject, action.subjectTag)) {
    log(
      `The action '${action.name}' cannot be performed by '${subject.name}'.`
    );
    return false;
  }
  if (action.objectTag && (!object || !testThing(object, action.objectTag))) {
    log(
      `The action '${action.name}' cannot be performed on '${
        object ? object.name : "nothing"
      }'.`
    );
    return false;
  }

  // perform any custom checks defined for this action
  return action.check(subject, object, Anything);
}
