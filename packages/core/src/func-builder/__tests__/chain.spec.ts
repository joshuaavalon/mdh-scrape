import { assert } from "chai";
import { ChainFuncBuilder } from "../chain.js";

import type { MdhTvEpisodeScraperEpisodeContext as Context, EpFunc } from "#episode";

const func1: EpFunc<number> = async () => {
  throw new Error();
};
const func2: EpFunc<number> = async ctx => ctx.epInfo.num * 2;

describe("Test wrapNearestEpFunc", async () => {
  it("should match", async () => {
    const builder = new ChainFuncBuilder([func1, func2]);
    const epFunc = builder.build();
    assert.equal(await epFunc({ epInfo: { num: 1 } } as Context), 2);
  });
});
