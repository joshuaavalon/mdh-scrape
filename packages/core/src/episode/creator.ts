import { PinoLoggerBuilder } from "#logger";
import { ChromeBuilder } from "#browser";

import type { Logger } from "pino";
import type { Browser, Request } from "playwright";
import type { TvEpisodeRecord } from "@media-data-hub/sdk";
import type { Builder } from "#type";
import type { MdhTvEpisodeScraper } from "./scraper.js";
import type { MdhTvEpisodeScraperContext, MdhTvEpisodeScraperEpisodeContext } from "./context.js";

export type ResourceType = "document" | "eventsource" | "fetch" | "font" | "image" | "manifest" | "media" | "other" | "script" | "stylesheet" | "texttrack" | "websocket" | "xhr";

export interface PageOptions {
  timeout: number;
  blockTypes: ResourceType[];
}

export interface MdhTvEpisodeCreatorOptions {
  scraperBuilder: Builder<MdhTvEpisodeScraper>;
  loggerBuilder: Builder<Logger>;
  browserBuilder: Builder<Promise<Browser>>;
  pageOpts: PageOptions;
}

export class MdhTvEpisodeCreator {
  private readonly scraperBuilder: Builder<MdhTvEpisodeScraper>;
  private readonly loggerBuilder: Builder<Logger>;
  private readonly browserBuilder: Builder<Promise<Browser>>;
  private readonly pageOpts: PageOptions;

  public constructor(opts: MdhTvEpisodeCreatorOptions) {
    const { scraperBuilder, loggerBuilder, browserBuilder, pageOpts } = opts;
    this.scraperBuilder = scraperBuilder;
    this.loggerBuilder = loggerBuilder;
    this.browserBuilder = browserBuilder;
    this.pageOpts = pageOpts;
  }

  public async scrape(fromEp: number, toEp: number): Promise<TvEpisodeRecord[]> {
    const logger = this.loggerBuilder.build();
    logger.info({ fromEp, toEp }, "Start scraping episode(s)");
    const browser = await this.browserBuilder.build();
    logger.debug({ fromEp, toEp }, "Launch browser");
    const scraper = this.scraperBuilder.build();
    const scraperContext: MdhTvEpisodeScraperContext = { browser, logger, record: {} };
    try {

    } finally {
      await browser.close();
    }
  }

  private async scrapeEpisode(
    scraper: MdhTvEpisodeScraper,
    scraperContext: MdhTvEpisodeScraperContext,
    epNum: number
  ): Promise<TvEpisodeRecord> {
    const { browser, logger } = scraperContext;
    logger.info({ epNum }, "Start scraping episode");
    const page = await browser.newPage();
    page.setDefaultTimeout(this.pageOpts.timeout);
    if (this.pageOpts.blockTypes.length > 0) {
      page.route("**/*", (route, req) => {
        if (this.pageOpts.blockTypes.includes(req.resourceType() as ResourceType)) {
          route.abort();
        } else {
          route.continue();
        }
      });
    }
    try {
      const ctx: MdhTvEpisodeScraperEpisodeContext = {
        ...scraperContext,
        page,
        epInfo: { num: epNum, padNum: epNum.toString().padStart(2, "0") }
      };
      const url = await scraper.scrapeUrl(ctx);
      logger.info({ epNum, url }, "Scraped URL");
      await page.goto(url);
      const name = await scraper.scrapeName(ctx);
      ctx.record.name = name;
      logger.info({ epNum, name }, "Selected title");
      const sortTitle = await scraper.scrapeSortName(browser, title);
      logger.info({ epNum, sortTitle }, "Selected sortTitle");
      const description = await selectDescription(page, epNum);
      logger.info({ epNum, description }, "Selected description");
      const airDate = await selectAirDate(page, epNum);
      logger.info({ epNum, airDate: airDate.toISODate() }, "Selected airDate");
      const imageUrls = await selectImages(browser, page, epNum);
      logger.info({ epNum, imageUrls }, "Selected imageUrls");
    } finally {
      await page.close();
    }
  }

  public static withDefault(opts: Partial<Omit<MdhTvEpisodeCreatorOptions, "scraperBuilder">> & Pick<MdhTvEpisodeCreatorOptions, "scraperBuilder">): MdhTvEpisodeCreator {
    const loggerBuilder = PinoLoggerBuilder.withDefault();
    const browserBuilder = ChromeBuilder.withDefault();
    return new MdhTvEpisodeCreator({
      loggerBuilder,
      browserBuilder,
      pageOpts: {
        timeout: 60 * 1000,
        blockTypes: ["image", "font", "media"]
      },
      ...opts
    });
  }
}
