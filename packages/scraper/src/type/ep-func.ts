import type { EpisodeContext } from "#context";

export type EpFunc<T> = (ctx: EpisodeContext) => Promise<T>;
