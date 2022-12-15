import { get as getTag, Something } from "../../core/tags";
import {
  define as defineRelationship,
  RelationshipOrder,
} from "../../core/relationships";

// tags relating to the physical world
export const tags = {
  long: getTag("long"),
  strong: getTag("strong"),
  thin: getTag("thin"),
  flammable: getTag("flammable"),
  lightable: getTag("lightable"),
  carryable: getTag("carryable"),
  supporter: getTag("supporter"),
  human: getTag("human"),
  container: getTag("container"),
  visible: getTag("visible"),
  touchable: getTag("touchable"),
};

// define some relationship types
export const relationships = {
  carrying: defineRelationship(
    tags.human,
    "carrying",
    RelationshipOrder.OneToMany,
    tags.carryable,
    "carried by"
  ),
  holding: defineRelationship(
    tags.human,
    "holding",
    RelationshipOrder.OneToOne,
    tags.carryable,
    "held by"
  ),
  supporting: defineRelationship(
    tags.supporter,
    "supporting",
    RelationshipOrder.OneToMany,
    tags.carryable,
    "supported by"
  ),
  containing: defineRelationship(
    tags.container,
    "containing",
    RelationshipOrder.OneToMany,
    Something,
    "contained by"
  ),
  viewing: defineRelationship(
    tags.visible,
    "viewing",
    RelationshipOrder.ManyToMany,
    tags.human,
    "viewed by"
  ),
  touching: defineRelationship(
    tags.human,
    "touching",
    RelationshipOrder.ManyToMany,
    tags.touchable,
    "touched by"
  ),
};
