import { assert } from "chai";
import { paddedEpNum } from "../padded-ep-num.js";

describe("Test paddedUrl", async () => {
  it("should pad", async () => {
    const url = await paddedEpNum`https://example.com/${2}.html`({ epInfo: { num: 1 } } as any);
    assert.equal(url, "https://example.com/01.html");
  });
});
