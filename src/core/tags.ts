// where Inform has kinds, which form a tree of types (i.e. an 'is a' relationship)),
// we instead use 'tags' which form a set of types (i.e. a 'has a' relationship).
export type Tag = Symbol;
// {
//     name: symbol,

//     //defaultValue: any,
// };

export function get(name: string): Tag {
  return Symbol.for(name) || Symbol(name);
}

export const Something = get("something");
