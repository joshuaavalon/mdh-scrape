import { chromium, firefox } from "playwright";
import { LoggableError, screenshotPage } from "@mdhs/core";
import { createPage } from "./create-page.js";

import type { Browser, LaunchOptions, Locator, Page } from "playwright";
import type { Listener } from "@joshuaavalon/async-event-emitter";
import type { EpisodeScraperEvents, EpisodeScraperPlugin, EpisodeScraperValueEventArgs } from "@mdhs/core";
import type { PageOptions } from "./create-page.js";

export type { ResourceType, PageOptions } from "./create-page.js";

export interface PlaywrightPluginOptions {
  type: "chromium" | "firefox";
  launchOptions: LaunchOptions;
  pageOptions: PageOptions;
}

function onInit(opts: PlaywrightPluginOptions): Listener<"init", EpisodeScraperEvents> {
  const { type, launchOptions, pageOptions } = opts;
  return async ctx => {
    const { logger } = ctx;
    switch (type) {
      case "chromium": {
        const defaultOpts = {
          executablePath: "/usr/bin/chromium",
          args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"]
        } satisfies LaunchOptions;
        logger.info("Launch chromium");
        ctx.browser = await chromium.launch({ ...defaultOpts, ...launchOptions });
        ctx.createPage = () => createPage(ctx.browser, pageOptions);
        break;
      }
      case "firefox": {
        const defaultOpts = {
          executablePath: "/usr/bin/firefox",
          args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"]
        } satisfies LaunchOptions;
        logger.info("Launch firefox");
        ctx.browser = await firefox.launch({ ...defaultOpts, ...launchOptions });
        ctx.createPage = () => createPage(ctx.browser, pageOptions);
        break;
      }
      default:
        logger.warn({ type }, "Ignore unknown browser type");
    }
  };
}

function onScrapeEpisodeStart(): Listener<"scrapeEpisodeStart", EpisodeScraperEvents> {
  return async (ctx, epCtx) => {
    const { scraper, logger } = ctx;
    const page = await ctx.createPage();
    epCtx.page = page;
    const url = await scraper.emitValue("scrapeUrl", ctx, epCtx);
    if (!url) {
      throw new LoggableError({ url }, "No value from scrapeUrl");
    }
    logger.info({ url }, "Navigate page");
    await page.goto(url);
    const rootSelector = await scraper.emitValue("selectPageRoot", ctx, epCtx) ?? "body";
    logger.info({ rootSelector }, "Select page root");
    epCtx.rootLocator = page.locator(rootSelector);
  };
}

export const playwrightPlugin: EpisodeScraperPlugin<PlaywrightPluginOptions> = async (scraper, opts) => {
  scraper.on("init", onInit(opts));
  scraper.on("scrapeEpisodeStart", onScrapeEpisodeStart());
  scraper.on("scrapeEpisodeError", async (_ctx, epCtx, result) => {
    const { page } = epCtx;
    result.value = { screenshot: await screenshotPage(page) };
  });
  scraper.on("scrapeEpisodeEnd", async (_ctx, epCtx) => {
    await epCtx.page.close();
  });
  scraper.on("close", async ctx => {
    await ctx.browser.close();
  });
};


declare module "@mdhs/core" {
  interface EpisodeScraperContext {
    browser: Browser;
    createPage: () => Promise<Page>;
  }

  interface EpisodeScraperEpisodeContext {
    page: Page;
    rootLocator: Locator;
  }

  interface EpisodeScraperEvents {
    scrapeUrl: EpisodeScraperValueEventArgs<string>;
    selectPageRoot: EpisodeScraperValueEventArgs<string>;
  }
}
