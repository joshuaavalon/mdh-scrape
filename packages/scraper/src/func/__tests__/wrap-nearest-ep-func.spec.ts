import { assert } from "chai";
import { wrapNearestEpFunc } from "../wrap-nearest-ep-func.js";

import type { EpFunc } from "#type";
import type { EpisodeContext } from "#context";

const func1: EpFunc<number> = async ctx => ctx.ep.num;
const func2: EpFunc<number> = async ctx => ctx.ep.num * 2;

describe("Test wrapNearestEpFunc", async () => {
  it("should match", async () => {
    const epFunc = wrapNearestEpFunc({ 1: func1, 3: func2 });
    assert.equal(await epFunc({ ep: { num: 1 } } as EpisodeContext), 1);
    assert.equal(await epFunc({ ep: { num: 2 } } as EpisodeContext), 2);
    assert.equal(await epFunc({ ep: { num: 3 } } as EpisodeContext), 6);
    assert.equal(await epFunc({ ep: { num: 4 } } as EpisodeContext), 8);
  });
});
