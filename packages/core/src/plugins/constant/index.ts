import type { EpisodeScraperPlugin, EpisodeScraperValueEventArgs, ScrapedEpisode } from "@mdhs/core";

export interface ConstantPluginOptions {
  episode?: Partial<ScrapedEpisode>;
  episodes?: Record<number, Partial<ScrapedEpisode>>;
}


interface ScrapeConstantFunc {
  (epNum: number): Partial<ScrapedEpisode>;
}

function onScrapeValue<T extends keyof ScrapedEpisode>(scrapeConstant: ScrapeConstantFunc, key: T): (...args: EpisodeScraperValueEventArgs<ScrapedEpisode[T]>) => void {
  return async (_ctx, epCtx, result) => {
    const { metadata } = epCtx;
    const value = scrapeConstant(metadata.num)?.[key];
    if (typeof value !== "undefined") {
      result.value = value;
    }
  };
}

export const constantPlugin: EpisodeScraperPlugin<ConstantPluginOptions> = async (scraper, opts) => {
  const { episode = {}, episodes = {} } = opts;
  const scrapeConstant: ScrapeConstantFunc = epNum => ({ ...episode, ...episodes[epNum] });
  scraper.on("scrapeName", onScrapeValue(scrapeConstant, "name"));
  scraper.on("scrapeSortName", onScrapeValue(scrapeConstant, "sortName"));
  scraper.on("scrapeDescription", onScrapeValue(scrapeConstant, "description"));
  scraper.on("scrapeAirDate", onScrapeValue(scrapeConstant, "airDate"));
  scraper.on("scrapeLanguage", onScrapeValue(scrapeConstant, "language"));
  scraper.on("scrapeCountry", onScrapeValue(scrapeConstant, "country"));
  scraper.on("scrapeTvSeason", onScrapeValue(scrapeConstant, "tvSeason"));
  scraper.on("scrapeRating", onScrapeValue(scrapeConstant, "rating"));
  scraper.on("scrapePosters", onScrapeValue(scrapeConstant, "posters"));
};

export default constantPlugin;
