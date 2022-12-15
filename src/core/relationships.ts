import pluralize from 'pluralize';
import { Tag, get as getTag } from './tags';
import { Thing, addRelationship } from './things';
import { ObjectContext, objectAllows } from './context';

export type RelationshipType = Symbol;

export enum RelationshipOrder {
    OneToOne = 0b00,
    OneToMany = 0b01,
    ManyToOne = 0b10,
    ManyToMany = 0b11
};

// Read this as 'type' relates 'Things with subjectTag' to 'Things with objectTag'
export type RelationshipDefinition = {
    type: RelationshipType,
    subjectTag: Tag,
    objectTag: Tag,
    order: RelationshipOrder,
    reversedType: RelationshipType,
};

// This represents a concrete type that has been made
export type Relationship = {
    type: RelationshipType,
    otherThing: Thing
};

export function define(
    subjectTag: Tag,
    name: string,
    order: RelationshipOrder,
    objectTag: Tag,
    reversedName: string,
): RelationshipDefinition {
    return {
        type: getTag(name),
        subjectTag,
        objectTag,
        order,
        reversedType: getTag(reversedName)
    };
}

export function make(
    subject: Thing,
    relationship: RelationshipDefinition,
    object: Thing,
    onSuccess: (subject: Thing, relationship: Relationship) => void,
    onFail: (err: string) => void,
) {
    const validSubject = subject.kinds.has(relationship.subjectTag);
    if (!validSubject) {
        return onFail(
            `${subject.name} is not ${relationship.subjectTag.description} ` +
            `(so cannot be ${relationship.type.description} ${object.name})`
        );
    }

    const validObject = object.kinds.has(relationship.objectTag);
    if (!validObject) {
        return onFail(
            `${object.name} is not ${relationship.objectTag.description} ` +
            `(so ${subject.name} cannot be ${relationship.type.description} it)`);
    }

    if (relationship.order === RelationshipOrder.OneToMany) {
        // the object can only have this relationship with one subject
        const o = object.relationships.filter(r => r.type === relationship.reversedType);
        if (o.length > 0) {
            return onFail(
                `${o[0].otherThing.name} is already ${relationship.type.description} ${object.name}` +
                ` (so ${subject.name} cannot be ${relationship.type.description} it)`
            );
        }
    } else if (relationship.order === RelationshipOrder.ManyToOne) {
        // this subject can only have this relationship with one subject
        const o = subject.relationships.filter(r => r.type === relationship.type);
        if (o.length > 0) {
            return onFail(
                `${subject.name} is already ${relationship.type.description} ${o[0].otherThing.name}` +
                ` (so ${object.name} cannot be ${relationship.type.description} it)`
            );
        }
    }

    onSuccess(subject, addRelationship(subject, relationship, object));
}

// export function test(subject: Thing, relationshipType: RelationshipType, object: Thing): boolean {
//     return subject.relationships.some(r => {
//         return r.type === relationshipType && 
//         (r.otherThing === object || (r.otherThing.kinds.has(
//     });
// }

export function test(subject: Thing, relationshipType: RelationshipType, object?: ObjectContext): boolean {
    return subject.relationships.some(r => {
        return r.type === relationshipType &&
            (!object || objectAllows({
                noun: r.otherThing,
                tags: r.otherThing.kinds
            }, object));
    });
}

export function describeDefinition(relationship: RelationshipDefinition): string {
    const subjectPlural = relationship.order & RelationshipOrder.ManyToOne;
    const objectPlural = relationship.order & RelationshipOrder.OneToMany;
    const subjectDeterminer = subjectPlural ? 'many' : 'a';
    const objectDeterminer = objectPlural ? 'many' : 'a';
    const name = relationship.type.description;
    const subject = relationship.subjectTag.description || '';
    const object = relationship.objectTag.description || '';
    return `${subjectDeterminer} ${subject} ${pluralize('thing', subjectPlural + 1)}` +
        ` can be ${name} ${objectDeterminer} ${object} ${pluralize('thing', objectPlural + 1)}`;
}

export function describe(thing: Thing, relationship: Relationship): string {
    const name = relationship.type.description;
    return `${thing.name} is currently ${name} ${relationship.otherThing.name}`;
}

// function getReversedRelationshipOrder(order: RelationshipOrder): RelationshipOrder {
//     switch (order) {
//         case RelationshipOrder.OneToOne: return RelationshipOrder.OneToOne;
//         case RelationshipOrder.OneToMany: return RelationshipOrder.ManyToOne;
//         case RelationshipOrder.ManyToOne: return RelationshipOrder.OneToMany;
//         case RelationshipOrder.ManyToMany: return RelationshipOrder.ManyToMany;
//     }
// }