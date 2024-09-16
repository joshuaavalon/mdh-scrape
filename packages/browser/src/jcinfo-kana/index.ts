import { LoggableError } from "@mdhs/core";

import type { EpisodeScraperPlugin } from "@mdhs/core";

export interface JcinfoKanaPluginOptions {
  url?: string;
}

export const jcinfoKanaPlugin: EpisodeScraperPlugin<JcinfoKanaPluginOptions> = async (scraper, opts) => {
  const { url = "https://www.jcinfo.net/ja/tools/kana" } = opts;
  scraper.on("scrapeSortName", async (ctx, epCtx, r) => {
    const { browser } = ctx;
    const { result, metadata } = epCtx;
    const { sortName } = result;
    if (!sortName) {
      throw new LoggableError({ result, metadata }, "SortName is empty");
    }
    const page = await browser.newPage();
    try {
      await page.goto(url);
      await page.fill("#input_text", sortName);
      await page.locator("label#is_katakana").click();
      await page.locator(".btn-primary").click();
      await page.waitForLoadState("load");
      const results = await page.locator("._result").allTextContents();
      if (results.length !== 3) {
        throw new LoggableError({ result, metadata }, "Cannot resolve Kana");
      }
      r.value = results[2].replaceAll("ヴ", "ゔ");
    } finally {
      await page.close();
    }
  });
};

