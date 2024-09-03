import { LoggableError } from "@mdhs/core";
import { pageScreenshot } from "#func";

import type { Builder } from "@mdhs/core";
import type { ScrapeImageDelegate } from "./delegate.js";

export class BrowserScrapeImageBuilder implements Builder<ScrapeImageDelegate> {
  public build(): ScrapeImageDelegate {
    return async (url, ctx) => {
      const { browser } = ctx;
      const page = await browser.newPage();
      const referer = ctx.page.url();
      const headers = { referer };
      try {
        page.setExtraHTTPHeaders(headers);
        const res = await page.goto(url);
        if (!res) {
          throw new LoggableError({ url, headers }, "Empty response");
        }
        if (res.status() >= 400) {
          const status = res.status();
          const screenshot = await pageScreenshot(page);
          const error = new LoggableError({ url, headers, status }, "Error response");
          error.setScreenshot(screenshot);
          throw error;
        }
        return await res.body();
      } catch (cause) {
        throw new LoggableError({ url, headers }, "Fail to fetch image via browser", { cause });
      } finally {
        await page.close();
      }
    };
  }
}
