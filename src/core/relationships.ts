import pluralize from "pluralize";
import { log } from "./log";
import { Tag, get as getTag } from "./tags";
import { Thing, addRelationship } from "./things";
import { ObjectContext, objectAllows } from "./context";

export type RelationshipType = Symbol;

export enum RelationshipOrder {
  OneToOne = 0b00,
  OneToMany = 0b01,
  ManyToOne = 0b10,
  ManyToMany = 0b11,
}

// Read this as 'type' relates 'Things with subjectTag' to 'Things with objectTag'
export type RelationshipDefinition = {
  type: RelationshipType;
  subjectTag: Tag;
  objectTag: Tag;
  order: RelationshipOrder;
  reversed?: RelationshipDefinition;
};

// This represents a concrete type that has been made
export type Relationship = {
  type: RelationshipType;
  otherThing: Thing;
};

export function define(
  subjectTag: Tag,
  name: string,
  order: RelationshipOrder,
  objectTag: Tag,
  reversedName: string
) {
  // actually defines a pair
  const relationship: RelationshipDefinition = {
    type: getTag(name),
    subjectTag,
    objectTag,
    order,
  };
  const reversed: RelationshipDefinition = {
    type: getTag(reversedName),
    subjectTag: objectTag,
    objectTag: subjectTag,
    order: getReversedRelationshipOrder(order),
  };
  relationship.reversed = reversed;
  reversed.reversed = relationship;
  return { [name]: relationship, [reversedName]: reversed };
}

export function make(
  subject: Thing,
  relationship: RelationshipDefinition,
  object: Thing,
  onFail?: (err: string) => void
) {
  // only check to see if this relationship would be allowed if the caller is
  // going to handle any problem
  if (onFail && !allowed(subject, relationship, object, onFail)) {
    return;
  }
  addRelationship(subject, relationship, object);
}

export function allowed(
  subject: Thing,
  relationship: RelationshipDefinition,
  object: Thing,
  onFail?: (err: string) => void
): boolean {
  const validSubject = subject.kinds.has(relationship.subjectTag);
  if (!validSubject) {
    onFail?.(
      `${subject.name} is not ${relationship.subjectTag.description} ` +
        `(so cannot be ${relationship.type.description} ${object.name})`
    );
    return false;
  }

  const validObject = object.kinds.has(relationship.objectTag);
  if (!validObject) {
    onFail?.(
      `${object.name} is not ${relationship.objectTag.description} ` +
        `(so ${subject.name} cannot be ${relationship.type.description} it)`
    );
    return false;
  }

  if (relationship.order === RelationshipOrder.OneToMany) {
    // the object can only have this relationship with one subject
    const o = object.relationships.filter(
      (r) => r.type === relationship.reversed!.type
    );
    if (o.length > 0) {
      onFail?.(
        `${o[0].otherThing.name} is already ${relationship.type.description} ${object.name}` +
          ` (so ${subject.name} cannot be ${relationship.type.description} it)`
      );
      return false;
    }
  } else if (relationship.order === RelationshipOrder.ManyToOne) {
    // this subject can only have this relationship with one subject
    const o = subject.relationships.filter((r) => r.type === relationship.type);
    if (o.length > 0) {
      onFail?.(
        `${subject.name} is already ${relationship.type.description} ${o[0].otherThing.name}` +
          ` (so ${object.name} cannot be ${relationship.type.description} it)`
      );
      return false;
    }
  }

  return true;
}

export function find(
  subject: Thing,
  relationshipType: RelationshipType,
  object?: ObjectContext
): Relationship | undefined {
  return subject.relationships.find((r) => {
    return (
      r.type === relationshipType &&
      (!object ||
        objectAllows(
          {
            noun: r.otherThing,
            tags: r.otherThing.kinds,
          },
          object
        ))
    );
  });
}

export function describeDefinition(
  relationship: RelationshipDefinition
): string {
  const subjectPlural = relationship.order & RelationshipOrder.ManyToOne;
  const objectPlural = relationship.order & RelationshipOrder.OneToMany;
  const subjectDeterminer = subjectPlural ? "many" : "a";
  const objectDeterminer = objectPlural ? "many" : "a";
  const name = relationship.type.description;
  const subject = relationship.subjectTag.description || "";
  const object = relationship.objectTag.description || "";
  return (
    `${subjectDeterminer} ${subject} ${pluralize("thing", subjectPlural + 1)}` +
    ` can be ${name} ${objectDeterminer} ${object} ${pluralize(
      "thing",
      objectPlural + 1
    )}`
  );
}

export function describe(thing: Thing, relationship: Relationship): string {
  const name = relationship.type.description;
  return `${thing.name} is currently ${name} ${relationship.otherThing.name}`;
}

function getReversedRelationshipOrder(
  order: RelationshipOrder
): RelationshipOrder {
  switch (order) {
    case RelationshipOrder.OneToOne:
      return RelationshipOrder.OneToOne;
    case RelationshipOrder.OneToMany:
      return RelationshipOrder.ManyToOne;
    case RelationshipOrder.ManyToOne:
      return RelationshipOrder.OneToMany;
    case RelationshipOrder.ManyToMany:
      return RelationshipOrder.ManyToMany;
  }
}
