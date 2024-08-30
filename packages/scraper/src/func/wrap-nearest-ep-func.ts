import { LoggableError } from "#error";

import type { EpFunc } from "#type";

export function wrapNearestEpFunc<T>(mapping: Record<number, EpFunc<T>>): EpFunc<T> {
  const epNum = Object.keys(mapping)
    .map(ep => Number.parseInt(ep))
    .filter(ep => ep > 0 && Number.isSafeInteger(ep))
    .toSorted();
  return function (ctx) {
    const { ep } = ctx;
    if (mapping[ep.num]) {
      return mapping[ep.num](ctx);
    }
    const nearestEp = epNum.findLast(epNo => epNo <= ep.num) ?? -1;
    if (nearestEp <= 0) {
      throw new LoggableError({ ep, epNum }, "Cannot find nearest episode number");
    }
    return mapping[nearestEp](ctx);
  };
}
