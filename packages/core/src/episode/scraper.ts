import type { DateTime } from "luxon";
import type { Logger } from "pino";
import type { Browser } from "playwright";
import type { TvEpisodeRecord } from "@media-data-hub/sdk";
import type { Builder } from "#type";
import type { MdhTvEpisodeScraperEpisodeContext } from "./context.js";

export interface MdhTvEpisodeScraper {
  scrapeUrl: EpFunc<string>;
  scrapeName: EpFunc<string>;
  scrapeSortName: EpFunc<string>;
  scrapeDescription: EpFunc<string>;
  scrapeAirDate: EpFunc<DateTime>;
  scrapeImageUrls: EpFunc<string[]>;
}

export type EpFunc<T> = (ctx: Readonly<MdhTvEpisodeScraperEpisodeContext>) => Promise<T>;
