/**
we can load and unload an extension

each extension can contain actions, tags, rules and relationships

when a extension is loaded, and definitions of the above concepts are available,
we check to see there are any conflicts (based on the concept's "name"
property

if there are conflicts, we throw an error

if there are no conflicts, we load the extension, adding the concepts it
provides to the current index

when an extension is unloaded, we remove the concepts it provides from the current index

however, we also need to remove all established *instances* of any of the actions,
tags, rules, and relationships that it defines from the current index

*/

import { Action } from "./actions";
import { RelationshipDefinition } from "./relationships";
import { Tag } from "./tags";

import {
  onRegisterTag,
  onRegisterAction,
  onRegisterRelationshipDefinition,
} from "./index";

export type Extension = {
  name: string;
  description: string;
  tags: Array<Tag>;
  actions: Array<Action>;
  relationships: Array<RelationshipDefinition>;
};

export function register(extension: Extension) {
  extension.tags.forEach((tag) => {
    onRegisterTag(tag, extension);
  });
  extension.actions.forEach((action) => {
    onRegisterAction(action, extension);
  });
  extension.relationships.forEach((relationship) => {
    onRegisterRelationshipDefinition(relationship, extension);
  });
}
