import { Action } from "./actions";
import {
  RelationshipDefinition,
  find as findRelationship,
} from "./relationships";
import { Something, Tag } from "./tags";
import { Thing } from "./things";

export class ObjectContext {
  object?: Thing;
  secondObject?: Thing;
  tags?: Set<Tag>;
}

export class Context {
  subject?: Thing;
  action?: Action;
  object?: ObjectContext;
  relationship?: RelationshipDefinition;
}

function tagsOverlap(tagsA: Set<Tag>, tagsB: Set<Tag>): boolean {
  return [...tagsA].some((t) => tagsB.has(t));
}

export function objectAllows(
  objectA: ObjectContext,
  objectB: ObjectContext
): boolean {
  if (objectA.object && objectB.object && objectB.object !== objectA.object)
    return false;
  if (
    objectA.secondObject &&
    objectB.secondObject &&
    objectB.secondObject !== objectA.secondObject
  ) {
    return false;
  }
  const objectATags = objectA.tags || objectA.object?.kinds;
  if (objectATags) {
    const objectBTags = objectB.tags || objectB.object?.kinds;
    if (
      !objectATags.has(Something) &&
      objectBTags &&
      !tagsOverlap(objectATags, objectBTags)
    ) {
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
    if (
      !findRelationship(
        current.subject,
        expected.relationship.type,
        expected.object
      )
    )
      return false;
  }
  return true;
}
