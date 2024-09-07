import { ChainFuncBuilder, LoggableError, PinoLoggerBuilder } from "@mdhs/core";
import { ChromeBuilder } from "@mdhs/browser";
import { BatchScrapeImageBuilder, BrowserScrapeImageBuilder, FetchScrapeImageBuilder, pageScreenshot } from "@mdhs/image";

import type { Logger } from "pino";
import type { Browser, Request, Route } from "playwright";
import type { MediaDataHub, TvEpisodeRecord } from "@media-data-hub/sdk";
import type { Builder, MdhTvEpisodeScraper, MdhTvEpisodeScraperContext, MdhTvEpisodeScraperEpisodeContext } from "@mdhs/core";
import type { BatchScrapeImageDelegate, ScrapeImageDelegate } from "@mdhs/image";
import type { RichDisplayRendering } from "./windmill.js";

export type ResourceType = "document" | "eventsource" | "fetch" | "font" | "image" | "manifest" | "media" | "other" | "script" | "stylesheet" | "texttrack" | "websocket" | "xhr";

export interface PageOptions {
  timeout: number;
  blockTypes: ResourceType[];
}

export interface MdhTvEpisodeExecutorOptions {
  scraperBuilder: Builder<MdhTvEpisodeScraper>;
  loggerBuilder: Builder<Logger>;
  browserBuilder: Builder<Promise<Browser>>;
  batchScrapeImageBuilder: Builder<BatchScrapeImageDelegate>;
  sdkBuilder: Builder<Promise<MediaDataHub>>;
  pageOpts: PageOptions;
}

interface MdhTvEpisodeExecutorContext {
  scraper: MdhTvEpisodeScraper;
  batchScrapeImage: BatchScrapeImageDelegate;
}

function range(start: number, end: number): number[] {
  if (start > end) {
    return [];
  }
  return [...Array(end - start).keys()].map(i => i + start);
}

export class MdhTvEpisodeExecutor {
  private readonly scraperBuilder: Builder<MdhTvEpisodeScraper>;
  private readonly loggerBuilder: Builder<Logger>;
  private readonly browserBuilder: Builder<Promise<Browser>>;
  private readonly batchScrapeImageBuilder: Builder<BatchScrapeImageDelegate>;
  private readonly sdkBuilder: Builder<Promise<MediaDataHub>>;
  private readonly pageOpts: PageOptions;

  public constructor(opts: MdhTvEpisodeExecutorOptions) {
    const { scraperBuilder, loggerBuilder, browserBuilder, batchScrapeImageBuilder, sdkBuilder, pageOpts } = opts;
    this.scraperBuilder = scraperBuilder;
    this.loggerBuilder = loggerBuilder;
    this.browserBuilder = browserBuilder;
    this.batchScrapeImageBuilder = batchScrapeImageBuilder;
    this.sdkBuilder = sdkBuilder;
    this.pageOpts = pageOpts;
  }

  public async scrape(fromEp: number, toEp: number): Promise<RichDisplayRendering> {
    const logger = this.loggerBuilder.build();
    logger.info({ fromEp, toEp }, "Start scraping episode(s)");
    const browser = await this.browserBuilder.build();
    logger.debug({ fromEp, toEp }, "Launch browser");
    const scraper = this.scraperBuilder.build();
    const batchScrapeImage = this.batchScrapeImageBuilder.build();
    const executorCtx: MdhTvEpisodeExecutorContext = { scraper, batchScrapeImage };
    const scraperCtx: MdhTvEpisodeScraperContext = { browser, logger, record: {} };
    const sdk = await this.sdkBuilder.build();
    const result: TvEpisodeRecord[] = [];
    try {
      await Promise.all(range(fromEp, toEp + 1).map(async epNum => {
        const data = await this.scrapeEpisode(executorCtx, scraperCtx, epNum);
        const res = await sdk.c("tvEpisode").create(data);
        for (const poster of res.posters) {
          const url = sdk.getAdminThumbUrl(res, poster);
          await fetch(url);
        }
        result.push(res);
      }));
      return {
        "table-row-object": result.toSorted((a, b) => {
          const { order: aOrder = 0 } = a;
          const { order: bOrder = 0 } = b;
          return aOrder - bOrder;
        })
      };
    } catch (err) {
      if (err instanceof LoggableError) {
        logger.error({ ...err.createLogObject(), err }, "Failed to scrape episode(s)");
      } else {
        logger.error({ err }, "Failed to scrape episode(s)");
      }
      if (err instanceof Error) {
        return {
          render_all: [{
            error: {
              name: err.name,
              message: err.message
            }
          }]
        };
      }
      return {
        render_all: [{
          error: {
            name: "Unknown Error",
            message: "Failed to scrape episode(s)"
          }
        }]
      };
    } finally {
      await browser.close();
    }
  }

  private blockRequest(route: Route, req: Request): void {
    if (this.pageOpts.blockTypes.includes(req.resourceType() as ResourceType)) {
      route.abort();
    } else {
      route.continue();
    }
  }

  private async scrapeEpisode(
    executorCtx: MdhTvEpisodeExecutorContext,
    scraperCtx: MdhTvEpisodeScraperContext,
    epNum: number
  ): Promise<FormData> {
    const { scraper, batchScrapeImage } = executorCtx;
    const { browser, logger } = scraperCtx;
    logger.info({ epNum }, "Start scraping episode");
    const page = await browser.newPage();
    page.setDefaultTimeout(this.pageOpts.timeout);
    if (this.pageOpts.blockTypes.length > 0) {
      page.route("**/*", this.blockRequest.bind(this));
    }
    try {
      const record: Partial<TvEpisodeRecord> = {};
      const ctx: MdhTvEpisodeScraperEpisodeContext = {
        ...scraperCtx,
        page,
        epInfo: { num: epNum, padNum: epNum.toString().padStart(2, "0") },
        record
      };
      const url = await scraper.scrapeUrl(ctx);
      logger.info({ epNum, url }, "Scraped URL");
      await page.goto(url);
      const name = await scraper.scrapeName(ctx);
      record.name = name;
      logger.info({ epNum, record }, "Scraped name");
      const sortName = await scraper.scrapeSortName(ctx);
      record.sortName = sortName;
      logger.info({ epNum, record }, "Scraped sortTitle");
      const description = await scraper.scrapeDescription(ctx);
      record.description = description;
      logger.info({ epNum, record }, "Scraped description");
      const language = await scraper.scrapeLanguage(ctx);
      record.language = language;
      logger.info({ epNum, record }, "Scraped language");
      const country = await scraper.scrapeCountry(ctx);
      record.country = country;
      logger.info({ epNum, record }, "Scraped country");
      const tvSeason = await scraper.scrapeTvSeason(ctx);
      record.tvSeason = tvSeason;
      logger.info({ epNum, record }, "Scraped tvSeason");
      const rating = await scraper.scrapeRating(ctx);
      record.rating = rating;
      logger.info({ epNum, record }, "Scraped rating");
      const airDate = await scraper.scrapeAirDate(ctx);
      record.airDate = airDate.toISODate();
      logger.info({ epNum, record }, "Scraped airDate");
      const imageUrls = await scraper.scrapeImageUrls(ctx);
      logger.info({ epNum, record, imageUrls }, "Scraped imageUrls");
      const images = await batchScrapeImage(imageUrls, ctx);

      const data = new FormData();
      for (const [key, value] of Object.entries(record)) {
        if (Array.isArray(value)) {
          continue;
        }
        data.append(key, value);
      }
      for (const { fileName, blob } of images) {
        data.append("posters", blob, fileName);
      }
      return data;
    } catch (cause) {
      const buffer = await pageScreenshot(page);
      const err = new LoggableError({}, "Failed to scrape episode", { cause });
      err.setScreenshot(buffer);
      throw err;
    } finally {
      await page.close();
    }
  }

  public static withDefault(opts: Partial<Omit<MdhTvEpisodeExecutorOptions, "scraperBuilder" | "sdkBuilder">> & Pick<MdhTvEpisodeExecutorOptions, "scraperBuilder" | "sdkBuilder">): MdhTvEpisodeExecutor {
    const loggerBuilder = PinoLoggerBuilder.withDefault();
    const browserBuilder = ChromeBuilder.withDefault();
    const scrapeImageBuilder: Builder<ScrapeImageDelegate> = new ChainFuncBuilder([
      new FetchScrapeImageBuilder().build(),
      new BrowserScrapeImageBuilder().build()
    ]);
    const batchScrapeImageBuilder = BatchScrapeImageBuilder.withDefault(scrapeImageBuilder.build());
    return new MdhTvEpisodeExecutor({
      loggerBuilder,
      browserBuilder,
      batchScrapeImageBuilder,
      pageOpts: {
        timeout: 60 * 1000,
        blockTypes: ["image", "font", "media"]
      },
      ...opts
    });
  }
}
