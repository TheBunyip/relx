import { make as makeThing } from "../core/things";

import { get as getTag } from "../core/tags";

// make some concrete things
export default {
  rope: makeThing("rope", [
    getTag("long"),
    getTag("strong"),
    getTag("thin"),
    getTag("flammable"),
    getTag("carryable"),
    getTag("visible"),
    getTag("touchable"),
  ]),
  candle: makeThing("candle", [
    getTag("thin"),
    getTag("flammable"),
    getTag("lightable"),
    getTag("carryable"),
    getTag("visible"),
    getTag("touchable"),
  ]),
  table: makeThing("table", [
    getTag("strong"),
    getTag("supporter"),
    getTag("visible"),
    getTag("touchable"),
  ]),
  bob: makeThing("bob", [
    getTag("character"),
    getTag("visible"),
    getTag("touchable"),
  ]),
  sue: makeThing("sue", [
    getTag("character"),
    getTag("visible"),
    getTag("touchable"),
  ]),
  box: makeThing("box", [
    getTag("flammable"),
    getTag("supporter"),
    getTag("container"),
    getTag("visible"),
    getTag("touchable"),
  ]),
  sun: makeThing("sun", [getTag("visible")]),
  invisbleMan: makeThing("invisible man", [
    getTag("character"),
    getTag("touchable"),
  ]),
};
