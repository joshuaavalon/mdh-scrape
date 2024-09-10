import { assert } from "chai";
import { Type } from "@sinclair/typebox";
import { Scraper } from "../index.js";

describe("Test Scraper", async () => {
  it("should match", async () => {
    const builder = new Scraper({ schema: { a: Type.String(), b: Type.Optional(Type.Number()) } });
    builder.set("a", "1");
    builder.set("b", 2);
    console.log(builder.build());
  });
});
