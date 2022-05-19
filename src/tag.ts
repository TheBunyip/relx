// where Inform has kinds, which form a tree of types (i.e. an 'is a' relationship)),
// we instead use 'tags' which form a set of types (i.e. a 'has a' relationship).
export type Tag = {
    name: symbol,

    //defaultValue: any,
};