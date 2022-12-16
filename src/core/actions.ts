import { Tag } from "./tags";
import { Thing } from "./things";
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

  subject: Tag;

  noun?: Tag;
  secondNoun?: Tag;

  check: FailableInstructions;
  carryOut: Instructions;
  report: Instructions;
};

export function define(
  subjectTag: Tag,
  name: string,
  nounTag?: Tag,
  secondNounTag?: Tag,
  onCheck?: FailableInstructions,
  onCarryOut?: Instructions,
  onReport?: Instructions
): Action {
  return {
    name,
    subject: subjectTag,
    noun: nounTag,
    secondNoun: secondNounTag,
    check: onCheck || check.bind(null, name),
    carryOut: onCarryOut || carryOut.bind(null, name),
    report: onReport || report.bind(null, name),
  };
}

export function execute(
  subject: Thing,
  action: Action,
  noun?: Thing,
  secondNoun?: Thing
): boolean {
  // pass basic reasonability checks (e.g. the noun exists)
  // these are usually to handle unusual situations in which this action
  // could be invoked
  for (const rule of rulebooks.before) {
    if (ruleAppliesTo(rule, action, subject, noun, secondNoun)) {
      if (!rule.instructions(subject, noun, secondNoun)) {
        return false;
      }
    }
  }

  // these are usually to handle unusual situations in which this action
  // could be invoked
  for (const rule of rulebooks.instead) {
    if (ruleAppliesTo(rule, action, subject, noun, secondNoun)) {
      if (!rule.instructions(subject, noun, secondNoun)) {
        return false;
      }
    }
  }

  // a mundane rule that checks the action is valid
  // e.g. make sure you're not trying to take something you're already carrying
  if (!action.check(subject, noun, secondNoun)) {
    return false;
  }

  // a mundane rule that carries out the action in a standard way
  // e.g. move an item into a character's inventory
  action.carryOut(subject, noun, secondNoun);

  // these are usually to handle unusual situations in which this action
  // could be invoked
  for (const rule of rulebooks.after) {
    if (ruleAppliesTo(rule, action, subject, noun, secondNoun)) {
      rule.instructions(subject, noun, secondNoun);
    }
  }

  // a mundane rule that gives a standard report of the action's outcome
  // e.g. "You took the rope"
  action.report(subject, noun, secondNoun);
  return true;
}

export function check(
  action: string,
  subject: Thing,
  noun?: Thing,
  secondNoun?: Thing
): boolean {
  log(
    `CHECKING: action ${action} (subject: ${subject.name}, noun: ${
      noun ? noun.name : "none"
    }, secondNoun: ${secondNoun ? secondNoun.name : "none"})`
  );
  return true;
}
export function carryOut(
  action: string,
  subject: Thing,
  noun?: Thing,
  secondNoun?: Thing
): boolean {
  log(
    `CARRYING OUT: action ${action} (subject: ${subject.name}, noun: ${
      noun ? noun.name : "none"
    }, secondNoun: ${secondNoun ? secondNoun.name : "none"})`
  );
  return true;
}

export function report(
  action: string,
  subject: Thing,
  noun?: Thing,
  secondNoun?: Thing
): boolean {
  log(
    `REPORTING: action ${action} (subject: ${subject.name}, noun: ${
      noun ? noun.name : "none"
    }, secondNoun: ${secondNoun ? secondNoun.name : "none"})`
  );
  return true;
}
