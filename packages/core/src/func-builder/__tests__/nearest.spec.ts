import { assert } from "chai";
import { NearestEpFuncBuilder } from "../nearest.js";

import type { MdhTvEpisodeScraperEpisodeContext as Context, EpFunc } from "#episode";

const func1: EpFunc<number> = async ctx => ctx.epInfo.num;
const func2: EpFunc<number> = async ctx => ctx.epInfo.num * 2;

describe("Test wrapNearestEpFunc", async () => {
  it("should match", async () => {
    const builder = new NearestEpFuncBuilder({ 1: func1, 3: func2 });
    const epFunc = builder.build();
    assert.equal(await epFunc({ epInfo: { num: 1 } } as Context), 1);
    assert.equal(await epFunc({ epInfo: { num: 2 } } as Context), 2);
    assert.equal(await epFunc({ epInfo: { num: 3 } } as Context), 6);
    assert.equal(await epFunc({ epInfo: { num: 4 } } as Context), 8);
  });
});
