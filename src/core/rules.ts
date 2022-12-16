import { Action } from "./actions";
import { Thing } from "./things";
import { Circumstance } from "./circumstances";

export type Instructions = (
  subject: Thing,
  noun?: Thing,
  secondNoun?: Thing
) => void;

export type FailableInstructions = (
  subject: Thing,
  noun?: Thing,
  secondNoun?: Thing
) => boolean;

type Rule = {
  circumstance: Circumstance;
  instructions: Instructions;
};

type FailableRule = {
  circumstance: Circumstance;
  instructions: FailableInstructions;
};

export const rulebooks = {
  before: new Array<FailableRule>(), // if circumstances are met, these rules are performed beforehand
  instead: new Array<FailableRule>(), // if circumstances are met, these rules are performed and the current action is stopped
  after: new Array<Rule>(), // if circumstances are met, these rules are performed and this action after the current action
};

export function insteadOf(
  circumstance: Circumstance,
  instructions: FailableInstructions
): void {
  rulebooks.instead.push({ circumstance, instructions });
}

export function before(
  circumstance: Circumstance,
  instructions: FailableInstructions
): void {
  rulebooks.before.push({ circumstance, instructions });
}

export function appliesTo(
  rule: Rule,
  action: Action,
  subject: Thing,
  noun?: Thing,
  secondNoun?: Thing
): boolean {
  return rule.circumstance({ action, subject, object: { noun, secondNoun } });
}
