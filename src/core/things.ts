import arrayToSentence from "array-to-sentence";
import { Relationship, RelationshipDefinition } from "./relationships";
import { objectAllows } from "./context";
import { Something, Tag } from "./tags";

export type Thing = {
  name: string;
  // unlike Inform, a thing can have multiple 'kinds' which are used to
  // determine its behaviours
  kinds: Set<Tag>;
  relationships: Array<Relationship>;
};

export function make(name: string, kinds: Tag[]): Thing {
  return {
    name,
    kinds: new Set([...kinds, Something]),
    relationships: [],
  };
}

export function addRelationship(
  subject: Thing,
  def: RelationshipDefinition,
  object: Thing
): Relationship {
  const relationship = {
    type: def.type,
    otherThing: object,
  };
  subject.relationships.push(relationship);

  // record the opposite relationship on the object (back to the subject)
  object.relationships.push({
    type: def.reversedType,
    otherThing: subject,
  });

  return relationship;
}

function findRelationship(subject: Thing, type: Tag, object: Thing): number {
  return subject.relationships.findIndex((r) => {
    return (
      r.type === type &&
      objectAllows(
        {
          noun: r.otherThing,
          tags: r.otherThing.kinds,
        },
        {
          noun: object,
          tags: object.kinds,
        }
      )
    );
  });
}

export function removeRelationship(
  subject: Thing,
  def: RelationshipDefinition,
  object: Thing
): void {
  const relationshipIndex = findRelationship(subject, def.type, object);
  if (relationshipIndex !== -1) {
    subject.relationships.splice(relationshipIndex, 1);
    const reversedRelationshipIndex = findRelationship(
      object,
      def.reversedType,
      subject
    );
    if (reversedRelationshipIndex !== -1) {
      object.relationships.splice(reversedRelationshipIndex, 1);
    }
  }
}

export function describe(thing: Thing): string {
  const kinds = arrayToSentence(
    [...thing.kinds].map((kind) => kind.description)
  );
  return `${thing.name} is ${kinds}`;
}

export function test(thing: Thing, tag: Tag): boolean {
  return thing.kinds.has(tag);
}
