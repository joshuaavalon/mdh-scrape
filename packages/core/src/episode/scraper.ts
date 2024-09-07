import type { DateTime } from "luxon";
import type { MdhTvEpisodeScraperEpisodeContext } from "./context.js";

export interface MdhTvEpisodeScraper {
  scrapeUrl: EpFunc<string>;
  scrapeName: EpFunc<string>;
  scrapeSortName: EpFunc<string>;
  scrapeDescription: EpFunc<string>;
  scrapeAirDate: EpFunc<DateTime<true>>;
  scrapeImageUrls: EpFunc<string[]>;
  scrapeRating: EpFunc<number>;
  scrapeLanguage: EpFunc<string>;
  scrapeCountry: EpFunc<string>;
  scrapeTvSeason: EpFunc<string>;
}

export type EpFunc<T> = (ctx: Readonly<MdhTvEpisodeScraperEpisodeContext>) => Promise<T>;
