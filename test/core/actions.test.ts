import { describe, expect, test } from "@jest/globals";
import * as Things from "../../src/core/things";
import * as Actions from "../../src/core/actions";
import { get as getTag } from "../../src/core/tags";

describe("appliesTo", () => {
  test("first object must be a matching kind", () => {
    const subjectKind = getTag("subject-type");
    const subject = Things.make("test-subject", [subjectKind]);
    const action = Actions.define(
      subjectKind,
      "test-action",
      getTag("needed-tag")
    );
    const thingWithMatchingKind = Things.make("test-object", [
      getTag("needed-tag"),
    ]);
    const thingWithoutMatchingKind = Things.make("test-object", []);

    expect(
      Actions.execute(subject, action, thingWithMatchingKind)
    ).toBeTruthy();
    expect(
      Actions.execute(subject, action, thingWithoutMatchingKind)
    ).toBeFalsy();
  });
});
