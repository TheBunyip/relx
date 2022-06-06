import { Tag } from './tags';
import { Thing } from './things';
import { Instructions, rulebooks, appliesTo as ruleAppliesTo } from './rules';
import { log } from './log';

export type Action = {
    // represents a character's intention to do something
    name: string,

    subject: Tag,

    noun?: Tag,
    secondNoun?: Tag,

    check: Instructions,
    carryOut: Instructions,
    report: Instructions
};

export function defineAction(
    subjectTag: Tag,
    name: string,
    nounTag?: Tag,
    secondNounTag?: Tag,
    onCheck?: Instructions,
    onCarryOut?: Instructions,
    onReport?: Instructions
): Action {
    return {
        name,
        subject: subjectTag,
        noun: nounTag,
        secondNoun: secondNounTag,
        check: onCheck || defaultCheck.bind(null, name),
        carryOut: onCarryOut || defaultCarryOut.bind(null, name),
        report: onReport || defaultReport.bind(null, name)
    };
}

export function execute(subject: Thing, action: Action, noun?: Thing, secondNoun?: Thing): void {
    // pass basic reasonability checks (e.g. the noun exists)
    // these are usually to handle unusual situations in which this action
    // could be invoked
    for (const rule of rulebooks.before) {
        if (ruleAppliesTo(rule, action, subject, noun, secondNoun)) {
            if (!rule.instructions(subject, noun, secondNoun)) {
                return;
            }
        }
    }

    // these are usually to handle unusual situations in which this action
    // could be invoked
    for (const rule of rulebooks.instead) {
        if (ruleAppliesTo(rule, action, subject, noun, secondNoun)) {
            if (!rule.instructions(subject, noun, secondNoun)) {
                return;
            }
        }
    }

    // a mundane rule that checks the action is valid
    // e.g. make sure you're not trying to take something you're already carrying
    if (!action.check(subject, noun, secondNoun)) {
        return;
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
}

export function defaultCheck(action: string, subject: Thing, noun?: Thing, secondNoun?: Thing): boolean {
    log(`Checking: action ${action} (subject: ${subject.name}, noun: ${noun ? noun.name : 'none'}, secondNoun: ${secondNoun ? secondNoun.name : 'none'})`);
    return true;
}
export function defaultCarryOut(action: string, subject: Thing, noun?: Thing, secondNoun?: Thing): boolean {
    log(`Carrying out: action ${action} (subject: ${subject.name}, noun: ${noun ? noun.name : 'none'}, secondNoun: ${secondNoun ? secondNoun.name : 'none'})`);
    return true;
}

export function defaultReport(action: string, subject: Thing, noun?: Thing, secondNoun?: Thing): boolean {
    log(`Reporting: action ${action} (subject: ${subject.name}, noun: ${noun ? noun.name : 'none'}, secondNoun: ${secondNoun ? secondNoun.name : 'none'})`);
    return true;
}