import { assert } from "console";
import { Action } from "./actions";
import { RelationshipDefinition } from "./relationships";
import { Tag } from "./tags";
import { Thing } from "./things";
import { Context, allows as contextAllows, ObjectContext } from "./context";

export type Circumstance = (context: Context) => boolean;

export type CircumstanceBuilder = {
  conditions: Circumstance[];
  currentContext: Context;
  is: (action: Action) => CircumstanceBuilder;
  already: (relationship: RelationshipDefinition) => CircumstanceBuilder;
  the: (object: Thing) => CircumstanceBuilder;
  andThe: (object: Thing) => CircumstanceBuilder;
  a: (tag: Tag) => CircumstanceBuilder;
  and: (circumstance: Circumstance) => CircumstanceBuilder;
  build: () => Circumstance;
};

function commitCurrentContextCircumstance(builder: CircumstanceBuilder) {
  if (builder.currentContext.subject) {
    const expectedContext = builder.currentContext;
    builder.conditions.push((currentContext: Context): boolean => {
      return contextAllows(currentContext, expectedContext);
    });
  }
  builder.currentContext = new Context();
}

function makeCircumstanceBuilder(): CircumstanceBuilder {
  const builder = {
    conditions: new Array<Circumstance>(),
    currentContext: new Context(),
    is: (action: Action): CircumstanceBuilder => {
      const ctx = builder.currentContext;
      assert(ctx.subject);
      ctx.action = action;
      return builder;
    },
    already: (relationship: RelationshipDefinition): CircumstanceBuilder => {
      const ctx = builder.currentContext;
      assert(ctx.subject);
      ctx.relationship = relationship;
      return builder;
    },
    the: (object: Thing): CircumstanceBuilder => {
      const ctx = builder.currentContext;
      assert(ctx.subject);
      assert(ctx.action || ctx.relationship);
      ctx.object = ctx.object || new ObjectContext();
      ctx.object.object = object;
      return builder;
    },
    a: (tag: Tag): CircumstanceBuilder => {
      const ctx = builder.currentContext;
      assert(builder.currentContext.subject);
      assert(
        builder.currentContext.action || builder.currentContext.relationship
      );
      builder.currentContext.object?.tags?.add(tag);
      return builder;
    },
    andThe: (secondObject: Thing): CircumstanceBuilder => {
      const ctx = builder.currentContext;
      assert(ctx.subject);
      assert(ctx.object && ctx.object.object);
      assert(ctx.action || ctx.relationship);
      ctx.object = ctx.object || new ObjectContext();
      ctx.object.secondObject = secondObject;
      return builder;
    },
    and: (circumstance: Circumstance): CircumstanceBuilder => {
      // commit the current context
      commitCurrentContextCircumstance(builder);
      builder.conditions.push(circumstance);
      return builder;
    },
    build: (): Circumstance => {
      commitCurrentContextCircumstance(builder);
      return (context: Context) =>
        builder.conditions.every((condition) => condition(context));
    },
  };
  return builder;
}

export function when(subject: Thing) {
  const builder = makeCircumstanceBuilder();
  builder.currentContext.subject = subject;
  return builder;
}
