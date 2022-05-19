import * as Thing from './thing';

const rope = Thing.make('rope', [
    { name: Symbol('long') },
    { name: Symbol('strong') },
    { name: Symbol('flammable') },
]);

console.log(Thing.describe(rope));