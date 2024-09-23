import { assert } from "chai";
import { paddedEpNum } from "../padded-ep-num.js";

import type { EpisodeScraperEventResult } from "#episode";

describe("Test paddedUrl", async () => {
  it("should pad", async () => {
    const result: EpisodeScraperEventResult<string> = {};
    paddedEpNum`https://example.com/${2}.html`({} as any, { metadata: { num: 1 } } as any, result);
    assert.equal(result.value, "https://example.com/01.html");
  });
});
