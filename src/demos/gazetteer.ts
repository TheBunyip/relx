import { make as makeThing } from "../core/things";

import { tags } from "../modules/physical-world/index";

// make some concrete things
export default {
  rope: makeThing("rope", [
    tags.long,
    tags.strong,
    tags.thin,
    tags.flammable,
    tags.carryable,
    tags.visible,
    tags.touchable,
  ]),
  candle: makeThing("candle", [
    tags.thin,
    tags.flammable,
    tags.lightable,
    tags.carryable,
    tags.visible,
    tags.touchable,
  ]),
  table: makeThing("table", [
    tags.strong,
    tags.supporter,
    tags.visible,
    tags.touchable,
  ]),
  bob: makeThing("bob", [tags.human, tags.visible, tags.touchable]),
  sue: makeThing("sue", [tags.human, tags.visible, tags.touchable]),
  box: makeThing("box", [
    tags.flammable,
    tags.supporter,
    tags.container,
    tags.visible,
    tags.touchable,
  ]),
  sun: makeThing("sun", [tags.visible]),
  invisbleMan: makeThing("invisible man", [tags.human, tags.touchable]),
};
