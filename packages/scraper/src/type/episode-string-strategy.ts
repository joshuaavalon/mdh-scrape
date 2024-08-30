import type { EpisodeContext } from "#context";

export interface EpisodeStringStrategy {
  (ctx: EpisodeContext): Promise<string>;
}
