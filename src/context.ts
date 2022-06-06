import { Action } from './actions';
import { RelationshipDefinition, test as testRelationship } from './relationships';
import { Something, Tag } from './tags';
import { Thing } from './things';

export class ObjectContext {
    noun?: Thing;
    secondNoun?: Thing;
    tags?: Set<Tag>;
}

export class Context {
    subject?: Thing;
    action?: Action;
    object?: ObjectContext;
    relationship?: RelationshipDefinition;
};

function tagsOverlap(tagsA: Set<Tag>, tagsB: Set<Tag>): boolean {
    return [...tagsA].some(t => tagsB.has(t));
}

export function objectAllows(objectA: ObjectContext, objectB: ObjectContext): boolean {
    if (objectA.noun && objectB.noun !== objectA.noun) return false;
    if (objectA.secondNoun && objectB.secondNoun !== objectA.secondNoun) return false;
    if (objectA.tags && objectB.noun) {
        if (!objectA.tags.has(Something) &&
            !tagsOverlap(objectA.tags, objectB.noun.kinds)) {
            return false;
        }
    }
    return true;
}

export function allows(current: Context, expected: Context): boolean {
    if (expected.subject && current.subject !== expected.subject) return false;
    if (expected.action && current.action !== expected.action) return false;
    if (expected.object && current.object) {
        if (!objectAllows(expected.object, current.object)) return false;
    }
    if (expected.relationship && current.subject) {
        if (!testRelationship(current.subject, expected.relationship.type, expected.object)) return false;
    }
    return true;
}