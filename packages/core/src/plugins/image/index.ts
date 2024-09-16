import { LoggableError } from "#error";

import type { EpisodeScraperContext, EpisodeScraperEpisodeContext, EpisodeScraperPlugin } from "#episode";
import type { ScrapedEpisode } from "#schema";


type KeyOfType<T, V> = keyof {
  [P in keyof T as T[P] extends V ? P : never]: any
};

export interface ImagePluginOptions {
}

function validateNotEmpty<T extends KeyOfType<ScrapedEpisode, string>>(key: T): (ctx: EpisodeScraperContext, epCtx: EpisodeScraperEpisodeContext) => void {
  return (_ctx, epCtx) => {
    const { result } = epCtx;
    if (!result[key]) {
      throw new LoggableError({ result }, `${key} is empty`);
    }
  };
}

export const imagePlugin: EpisodeScraperPlugin<ImagePluginOptions> = async scraper => {
  scraper.on("postScrapeName", validateNotEmpty("name"));
  scraper.on("postScrapeSortName", validateNotEmpty("sortName"));
  scraper.on("postScrapeTvSeason", validateNotEmpty("tvSeason"));
  scraper.on("postScrapeLanguage", validateNotEmpty("language"));
  scraper.on("postScrapeCountry", validateNotEmpty("country"));
};

