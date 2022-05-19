
export type Activity = {
    // represents 

    beforeRules: [],
    forRules: [],
    afterRules: [],

};

export type Action = {
    // represents a character's intention to do something

    noun: string,
    secondNoun: string | null,

    check: () => boolean,
    carryOut: () => void,
    report: () => string | null,

    beforeRules: [], // if circumstances are met, these rules are performed beforehand
    insteadRules: [], // if circumstances are met, these rules are performed and the current action is stopped
    afterRules: [], // if circumstances are met, these rukes are performed and this action after the current action
};

export type Verb = {
    name: string, // be, have, contain, support, carry, wear, incorporate, be part of, be adjacent to
};

export type Circumstance = {
    // represents a circumstance that can be checked for
};

export type Rule = {
    circumstances: Set<Circumstance>, // instead of eating the napkin...
    instructions: Array<Activity> // ...say: why not wait for the actual dinner to arrive?
};

export const RulebookNames = {
    instead: Symbol('instead rules'),
    before: Symbol('before rules'),
    after: Symbol('after rules'),
    visibiity: Symbol('visibility rules'),
    everyTurn: Symbol('every turn rules'),
};

export type Rulebook = {
    // a list of rules that are sorted to put the ones with the most specific
    // circumstances first
    name: Symbol,
    rules: Array<Rule>,
};
