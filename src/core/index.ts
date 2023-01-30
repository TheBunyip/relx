import { Action } from "./actions";
import { RelationshipDefinition } from "./relationships";
import { Extension } from "./extensions";
import { Tag } from "./tags";

import { log } from "./log";

// define the current index, which is made up of actions, tags, rules and relationships
// along with methods to add and remove each from the index

const index = {
  actions: new Array<Action>(),
  tags: new Array<Tag>(),
  rules: [],
  relationships: new Array<RelationshipDefinition>(),
  things: [],
};

export const actionsByName = new Map<string, Action>();
export const relationshipsByName = new Map<string, RelationshipDefinition>();
export const extensions = new Set<Extension>();

export function onRegisterAction(def: Action, extension: Extension) {
  // check there isn't already a definition for this action
  if (index.actions.some((a) => a.name === def.name)) {
    log(
      `Extension ${extension.name} tried to create an action called ${def.name}, but it already exists. Skipping.`
    );
    return;
  }

  // add to the list of relationships that users can access
  index.actions.push(def);

  // for easy access
  actionsByName.set(def.name, def);

  // record that the extension is loaded
  extensions.add(extension);
}

export function onRegisterTag(def: Tag, extension: Extension) {
  // check there isn't already a definition for this action
  if (index.tags.some((a) => a === def)) {
    log(
      `Extension ${extension.name} tried to create a tag called ${def.description}, but it already exists. Skipping.`
    );
    return;
  }

  // add to the list of relationships that users can access
  index.tags.push(def);

  // record that the extension is loaded
  extensions.add(extension);
}

export function onRegisterRelationshipDefinition(
  def: RelationshipDefinition,
  extension: Extension
) {
  // check there isn't already a definition for this relationship
  if (index.relationships.some((r) => r.name === def.name)) {
    log(
      `Extension ${extension.name} tried to create a relationship called ${def.name}, but it already exists. Skipping.`
    );
    return;
  }

  // add to the list of relationships that users can access
  index.relationships.push(def);

  // for easy access
  relationshipsByName.set(def.name, def);

  // record that the extension is loaded
  extensions.add(extension);
}
