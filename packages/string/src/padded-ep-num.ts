import type { EpFunc } from "@mdhs/mdhsr";

export function paddedEpNum(templates: TemplateStringsArray, ...padSizes: number[]): EpFunc<string> {
  return async function paddedEpNumStrategy(ctx) {
    const { ep } = ctx;
    return templates
      .map((template, i) => {
        const padEpNum = i < padSizes.length ? ep.num.toString().padStart(padSizes[i], "0") : "";
        return template + padEpNum;
      })
      .join("");
  };
}
