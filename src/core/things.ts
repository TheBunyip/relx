import arrayToSentence from "array-to-sentence";
import {
  Relationship,
  RelationshipDefinition,
  find as findRelationship,
} from "./relationships";
import { Something, Tag } from "./tags";

export type Thing = {
  name: string;
  // unlike Inform, a thing can have multiple 'kinds' which are used to
  // determine its behaviours
  kinds: Set<Tag>;
  relationships: Array<Relationship>;
};

export const Anything = make("Anything", [Something]);

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
    type: def.reversed!.type,
    otherThing: subject,
  });

  return relationship;
}

export function removeRelationship(
  subject: Thing,
  def: RelationshipDefinition,
  object?: Thing
): void {
  const relationship = findRelationship(subject, def.type, { object: object });
  if (relationship) {
    subject.relationships = subject.relationships.filter(
      (r) => r !== relationship
    );
    const reversedSubject = relationship.otherThing;
    reversedSubject.relationships = reversedSubject.relationships.filter(
      (r) => r.type !== def.reversed!.type || r.otherThing !== subject
    );
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
