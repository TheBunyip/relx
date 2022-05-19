import arrayToSentence from 'array-to-sentence';

import { Tag } from './tag';

export type Thing = {
    name: string,
    // unlike Inform, a thing can have multiple 'kinds' which are used to
    // determine its behaviours
    kinds: Set<Tag>,
};

export function make(name: string, kinds: Tag[]): Thing {
    return {
        name,
        kinds: new Set(kinds)
    };
}

export function describe(thing: Thing): string {
    const kinds = arrayToSentence(([...thing.kinds]).map(kind => kind.name.description));
    return `${thing.name} is ${kinds}`;
}