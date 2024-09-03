import type { MdhTvEpisodeScraperEpisodeContext } from "@mdhs/core";

export interface ScrapeImageDelegate {
  (url: string, ctx: MdhTvEpisodeScraperEpisodeContext): Promise<Buffer>;
}
