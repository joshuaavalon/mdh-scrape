import type { Locator } from "playwright";
import type { EpisodeScraperContext, EpisodeScraperEpisodeContext, EpisodeScraperValueEventArgs } from "@mdhs/core";

export interface PageSelector<T> {
  (root: Locator, ctx: EpisodeScraperContext, epCtx: EpisodeScraperEpisodeContext): Promise<T>;
}

export function selectPage<T>(selector: PageSelector<T>): (...args: EpisodeScraperValueEventArgs<T>) => Promise<void> {
  return async (ctx, epCtx, result) => {
    const { rootLocator } = epCtx;
    result.value = await selector(rootLocator, ctx, epCtx);
  };
}
