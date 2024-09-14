import { AsyncEventEmitter } from "@joshuaavalon/async-event-emitter";

import type { Logger } from "pino";
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

export interface EpisodeScraperContext {

}

export interface EpisodeScraperPlugin<T> {
  (scraper: EpisodeScraper, opts: T): Promise<void>;
}

export interface EpisodeScraperEventResult<T> {
  value?: T;
}

export interface EpisodeScraperEvents {
  init: [EpisodeScraper, EpisodeScraperContext];
  close: [EpisodeScraper, EpisodeScraperContext];
}

export interface EpisodeScraperOptions {
  logger: Logger;
}

export class EpisodeScraper extends AsyncEventEmitter<EpisodeScraperEvents> {
  public readonly logger: Logger;

  public constructor(opts: EpisodeScraperOptions) {
    super();
    const { logger } = opts;
    this.logger = logger;
  }

  public async register<T>(plugin: EpisodeScraperPlugin<T>, opts: T): Promise<void> {
    await plugin(this, opts);
  }

  public async scrape(): Promise<void> {
    const ctx: EpisodeScraperContext = {};
    await this.emit("init", this, ctx);
  }
}
