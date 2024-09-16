import type { EpisodeScraperValueEventArgs } from "@mdhs/core";

export function paddedEpNum(templates: TemplateStringsArray, ...padSizes: number[]): (...args: EpisodeScraperValueEventArgs<string>) => void {
  return async (_ctx, epCtx) => {
    const { metadata } = epCtx;
    return templates
      .map((template, i) => {
        const padEpNum = i < padSizes.length ? metadata.num.toString().padStart(padSizes[i], "0") : "";
        return template + padEpNum;
      })
      .join("");
  };
}
