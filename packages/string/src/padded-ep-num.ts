import type { EpFunc } from "@mdhs/core";

export function paddedEpNum(templates: TemplateStringsArray, ...padSizes: number[]): EpFunc<string> {
  return async function paddedEpNumStrategy(ctx) {
    const { epInfo } = ctx;
    return templates
      .map((template, i) => {
        const padEpNum = i < padSizes.length ? epInfo.num.toString().padStart(padSizes[i], "0") : "";
        return template + padEpNum;
      })
      .join("");
  };
}
