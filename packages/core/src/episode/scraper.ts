import { Value } from "@sinclair/typebox/value";

import { AsyncEventEmitter } from "@joshuaavalon/async-event-emitter";
import { LoggableError } from "#error";
import { scrapedEpisodeSchema } from "#schema";

import type { Logger } from "pino";
import type { DateTime } from "luxon";
import type { File, ScrapedEpisode } from "#schema";

export interface EpisodeScraperContext {
  scraper: EpisodeScraper;
  logger: Logger;
}

export interface EpisodeMetadata {
  num: number;
  padNum: string;
}

export interface EpisodeScraperEpisodeContext {
  metadata: Readonly<EpisodeMetadata>;
  result: Partial<ScrapedEpisode>;
}

export interface EpisodeScraperPlugin<T> {
  (scraper: EpisodeScraper, opts: T): Promise<void>;
}

export interface EpisodeScraperEventResult<T> {
  value?: T;
}

export interface EpisodeScraperEvents {
  init: [EpisodeScraperContext];
  scrapeEpisodeStart: EpisodeScraperEventArgs;
  scrapeEpisodeEnd: EpisodeScraperEventArgs;
  scrapeEpisodeError: EpisodeScraperValueEventArgs<Record<string, unknown>>;
  preScrapeName: EpisodeScraperEventArgs;
  scrapeName: EpisodeScraperValueEventArgs<string>;
  postScrapeName: EpisodeScraperEventArgs;
  preScrapeSortName: EpisodeScraperEventArgs;
  scrapeSortName: EpisodeScraperValueEventArgs<string>;
  postScrapeSortName: EpisodeScraperEventArgs;
  preScrapeDescription: EpisodeScraperEventArgs;
  scrapeDescription: EpisodeScraperValueEventArgs<string>;
  postScrapeDescription: EpisodeScraperEventArgs;
  preScrapeAirDate: EpisodeScraperEventArgs;
  scrapeAirDate: EpisodeScraperValueEventArgs<DateTime<true>>;
  postScrapeAirDate: EpisodeScraperEventArgs;
  preScrapeRating: EpisodeScraperEventArgs;
  scrapeRating: EpisodeScraperValueEventArgs<number>;
  postScrapeRating: EpisodeScraperEventArgs;
  preScrapeLanguage: EpisodeScraperEventArgs;
  scrapeLanguage: EpisodeScraperValueEventArgs<string>;
  postScrapeLanguage: EpisodeScraperEventArgs;
  preScrapeCountry: EpisodeScraperEventArgs;
  scrapeCountry: EpisodeScraperValueEventArgs<string>;
  postScrapeCountry: EpisodeScraperEventArgs;
  preScrapeTvSeason: EpisodeScraperEventArgs;
  scrapeTvSeason: EpisodeScraperValueEventArgs<string>;
  postScrapeTvSeason: EpisodeScraperEventArgs;
  preScrapePosters: EpisodeScraperEventArgs;
  scrapePosters: EpisodeScraperValueEventArgs<File[]>;
  postScrapePosters: EpisodeScraperEventArgs;
  close: [EpisodeScraperContext];
}

type KeyOfType<T, V> = keyof {
  [P in keyof T as T[P] extends V ? P : never]: any
};

export type EpisodeScraperValueEventArgs<T> = [EpisodeScraperContext, EpisodeScraperEpisodeContext, EpisodeScraperEventResult<T>];
export type EpisodeScraperEventArgs = [EpisodeScraperContext, EpisodeScraperEpisodeContext];
export type EpisodeScraperValueEventKeys = KeyOfType<EpisodeScraperEvents, EpisodeScraperValueEventArgs<any>>;

type PreEvent<T extends string> = `pre${Capitalize<T>}`;
type PostEvent<T extends string> = `post${Capitalize<T>}`;
type UnPreEvent<T extends string> = T extends `pre${infer K}` ? Uncapitalize<K> : never;
type UnPostEvent<T extends string> = T extends `post${infer K}` ? Uncapitalize<K> : never;

type EpisodeScraperValueEventPreKeys = UnPreEvent<KeyOfType<EpisodeScraperEvents, EpisodeScraperEventArgs> & PreEvent<EpisodeScraperValueEventKeys>>;
type EpisodeScraperValueEventPostKeys = UnPostEvent<KeyOfType<EpisodeScraperEvents, EpisodeScraperEventArgs> & PostEvent<EpisodeScraperValueEventKeys>>;

type EpisodeScraperValueEventFullKeys = EpisodeScraperValueEventKeys & EpisodeScraperValueEventPostKeys & EpisodeScraperValueEventPreKeys;

type ValueEventValue<T> = T extends EpisodeScraperValueEventArgs<infer K> ? K : never;
export type EpisodeScraperValueEventValue<T extends EpisodeScraperValueEventKeys> = ValueEventValue<EpisodeScraperEvents[T]>;

export interface EpisodeScraperOptions {
  logger: Logger;
}


function range(start: number, end: number): number[] {
  if (start > end) {
    return [];
  }
  return [...Array(end - start).keys()].map(i => i + start);
}

function preEvent<T extends EpisodeScraperValueEventFullKeys>(event: T): PreEvent<T> {
  return `pre${event.charAt(0).toUpperCase()}${event.slice(1)}` as PreEvent<T>;
}

function postEvent<T extends EpisodeScraperValueEventFullKeys>(event: T): PostEvent<T> {
  return `post${event.charAt(0).toUpperCase()}${event.slice(1)}` as PostEvent<T>;
}

export class EpisodeScraper extends AsyncEventEmitter<EpisodeScraperEvents> {
  private readonly logger: Logger;

  public constructor(opts: EpisodeScraperOptions) {
    super();
    const { logger } = opts;
    this.logger = logger;
  }

  public async register<T>(plugin: EpisodeScraperPlugin<T>, opts: T): Promise<void> {
    await plugin(this, opts);
  }

  public async scrape(fromEp: number, toEp: number): Promise<(LoggableError | ScrapedEpisode)[]> {
    const ctx: EpisodeScraperContext = { scraper: this, logger: this.logger };
    await this.emit("init", ctx);
    try {
      this.logger.info({ fromEp, toEp }, "Start scraping episode(s)");
      return await Promise.all(range(fromEp, toEp + 1).map(async epNum => await this.scrapeEpisode(ctx, epNum)));
    } finally {
      await this.emit("close", ctx);
    }
  }

  private async scrapeEpisode(ctx: EpisodeScraperContext, epNum: number): Promise<LoggableError | ScrapedEpisode> {
    const result: Partial<ScrapedEpisode> = {};
    const epCtx: EpisodeScraperEpisodeContext = {
      metadata: { num: epNum, padNum: epNum.toString().padStart(2, "0") },
      result
    };
    try {
      await this.emit("scrapeEpisodeStart", ctx, epCtx);

      await this.scrapeValue("scrapeName", ctx, epCtx, "name");
      this.logger.info({ epNum, result }, "Scraped name");

      await this.scrapeValue("scrapeSortName", ctx, epCtx, "sortName");
      this.logger.info({ epNum, result }, "Scraped sortName");

      await this.scrapeValue("scrapeDescription", ctx, epCtx, "description");
      this.logger.info({ epNum, result }, "Scraped description");

      await this.scrapeValue("scrapeLanguage", ctx, epCtx, "language");
      this.logger.info({ epNum, result }, "Scraped language");

      await this.scrapeValue("scrapeCountry", ctx, epCtx, "country");
      this.logger.info({ epNum, result }, "Scraped country");

      await this.scrapeValue("scrapeTvSeason", ctx, epCtx, "tvSeason");
      this.logger.info({ epNum, result }, "Scraped tvSeason");

      await this.scrapeValue("scrapeRating", ctx, epCtx, "rating");
      this.logger.info({ epNum, result }, "Scraped rating");

      await this.scrapeValue("scrapeAirDate", ctx, epCtx, "airDate");
      this.logger.info({ epNum, result }, "Scraped airDate");

      await this.scrapeValue("scrapePosters", ctx, epCtx, "posters");
      this.logger.info({ epNum, result }, "Scraped posters");

      if (!Value.Check(scrapedEpisodeSchema, result)) {
        const errors = Value.Errors(scrapedEpisodeSchema, result);
        throw LoggableError.fromValidation(errors);
      }
      return result;
    } catch (cause) {
      const result = await this.emitValue("scrapeEpisodeError", ctx, epCtx) ?? {};
      const { screenshot, ...others } = result;
      let err: LoggableError;
      if (Buffer.isBuffer(screenshot)) {
        err = new LoggableError({ ...others }, "Fail to scrape episode", { cause });
        err.setScreenshot(screenshot);
      } else {
        err = new LoggableError({ ...result }, "Fail to scrape episode", { cause });
      }
      this.logger.error({ epCtx, ...err.createLogObject(), err }, err.message);
      return err;
    } finally {
      await this.emit("scrapeEpisodeEnd", ctx, epCtx);
    }
  }

  public async emitValue<T extends EpisodeScraperValueEventKeys>(event: T, ctx: EpisodeScraperContext, epCtx: EpisodeScraperEpisodeContext): Promise<EpisodeScraperValueEventValue<T> | undefined> {
    const result: EpisodeScraperEventResult<any> = {};
    await this.emit(event, ctx, epCtx, result);
    return result.value;
  }

  // eslint-disable-next-line max-params
  private async scrapeValue<T extends EpisodeScraperValueEventFullKeys>(event: T, ctx: EpisodeScraperContext, epCtx: EpisodeScraperEpisodeContext, name: keyof ScrapedEpisode): Promise<void> {
    await this.emit(preEvent(event), ctx, epCtx);
    const result: EpisodeScraperEventResult<any> = {};
    await this.emit(event, ctx, epCtx, result);
    epCtx.result[name] = result.value;
    await this.emit(postEvent(event), ctx, epCtx);
  }
}
