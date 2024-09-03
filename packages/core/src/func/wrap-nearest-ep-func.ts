import { LoggableError } from "#error";

import type { EpFunc } from "#episode";

export function wrapNearestEpFunc<T>(mapping: Record<number, EpFunc<T>>): EpFunc<T> {
  const epNum = Object.keys(mapping)
    .map(ep => Number.parseInt(ep))
    .filter(ep => ep > 0 && Number.isSafeInteger(ep))
    .toSorted();
  return function (ctx) {
    const { epInfo } = ctx;
    if (mapping[epInfo.num]) {
      return mapping[epInfo.num](ctx);
    }
    const nearestEp = epNum.findLast(epNo => epNo <= epInfo.num) ?? -1;
    if (nearestEp <= 0) {
      throw new LoggableError({ epInfo, epNum }, "Cannot find nearest episode number");
    }
    return mapping[nearestEp](ctx);
  };
}
