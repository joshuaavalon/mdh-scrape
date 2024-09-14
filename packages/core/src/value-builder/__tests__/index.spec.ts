import { assert } from "chai";
import { Type } from "@sinclair/typebox";
import { LoggableError } from "#error";
import { ValueBuilder } from "../index.js";

describe("Test ValueBuilder", async () => {
  it("should build", async () => {
    const scraper = new ValueBuilder({ schema: { a: Type.String(), b: Type.Optional(Type.Number()) } });
    scraper.set("a", "1");
    scraper.set("b", 2);
    console.log(scraper.build());
    assert.deepEqual(scraper.build(), { a: "1", b: 2 });
  });

  it("should build with optional", async () => {
    const scraper = new ValueBuilder({ schema: { a: Type.String(), b: Type.Optional(Type.Number()) } });
    scraper.set("a", "1");
    assert.deepEqual(scraper.build(), { a: "1" });
  });

  it("should not build", async () => {
    const scraper = new ValueBuilder({ schema: { a: Type.String(), b: Type.Optional(Type.Number()) } });
    assert.throw(() => scraper.build(), LoggableError);
  });
});
