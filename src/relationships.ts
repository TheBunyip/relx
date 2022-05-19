import { Tag } from './tag';

export const RelationshipNames = {
    containment: Symbol('containment'),
    support: Symbol('support'),
    incorporation: Symbol('incorporation'),
    carrying: Symbol('carrying'),
    wearing: Symbol('wearing'),
    possession: Symbol('possession'),
    adjacency: Symbol('adjacency'),
    visibility: Symbol('visibility'),
    touchability: Symbol('touchability'),
};

export type Relationship = {
    type: Symbol,
    subjectKind: Tag,
    subjectPlural: boolean,
    objectKind: Tag,
    objectPlural: boolean,
};

export function makeRelationship(
    type: Symbol,
    subjectKind: Tag,
    subjectPlural: boolean,
    objectKind: Tag,
    objectPlural: boolean
): Relationship {
    return {
        type,
        subjectKind,
        subjectPlural,
        objectKind,
        objectPlural,
    };
}

// examples
const r1 = makeRelationship(
    RelationshipNames.containment,
    { name: Symbol('napkin') },
    false,
    { name: Symbol('hamper') },
    true
);