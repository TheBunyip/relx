import { get as getTag } from './tags';
import { make as makeThing } from './things';
import {
    define as defineRelationship,
    RelationshipOrder,
} from './relationships';

// make some tags
export const tags = {
    long: getTag('long'),
    strong: getTag('strong'),
    thin: getTag('thin'),
    flammable: getTag('flammable'),
    lightable: getTag('lightable'),
    carryable: getTag('carryable'),
    supporter: getTag('supporter'),
    human: getTag('human'),
    container: getTag('container'),
    visible: getTag('visible'),
    touchable: getTag('touchable'),
};

// make some concrete things
export const gazetteer = {
    rope: makeThing('rope', [tags.long, tags.strong, tags.thin, tags.flammable, tags.carryable, tags.visible, tags.touchable]),
    candle: makeThing('candle', [tags.thin, tags.flammable, tags.lightable, tags.carryable, tags.visible, tags.touchable]),
    table: makeThing('table', [tags.strong, tags.supporter, tags.visible, tags.touchable]),
    bob: makeThing('bob', [tags.human, tags.visible, tags.touchable]),
    sue: makeThing('sue', [tags.human, tags.visible, tags.touchable]),
    box: makeThing('box', [tags.flammable, tags.supporter, tags.container, tags.visible, tags.touchable]),
    sun: makeThing('sun', [tags.visible]),
    invisbleMan: makeThing('invisible man', [tags.human, tags.touchable]),
};

// define some relationship types
export const relationships = {
    carrying: defineRelationship(tags.human, 'carrying', RelationshipOrder.OneToMany, tags.carryable, 'carried by'),
    holding: defineRelationship(tags.human, 'holding', RelationshipOrder.OneToOne, tags.carryable, 'held by'),
    supporting: defineRelationship(tags.supporter, 'supporting', RelationshipOrder.OneToMany, tags.carryable, 'supported by'),
    containing: defineRelationship(tags.container, 'containing', RelationshipOrder.OneToMany, tags.container, 'contained by'),
    viewing: defineRelationship(tags.visible, 'viewing', RelationshipOrder.ManyToMany, tags.human, 'viewed by'),
    touching: defineRelationship(tags.human, 'touching', RelationshipOrder.ManyToMany, tags.touchable, 'touched by'),
};