import { randomUUID } from "node:crypto";
import imageType from "image-type";
import { LoggableError, screenshotPage } from "@mdhs/core";

import type { Browser } from "playwright";
import type { File } from "@mdhs/core";

export async function fetchBrowserImage(browser: Browser, url: string, referer?: string): Promise<File> {
  const page = await browser.newPage();
  const headers = referer ? { referer } : { referer: url };
  try {
    page.setExtraHTTPHeaders(headers);
    const res = await page.goto(url);
    if (!res) {
      throw new LoggableError({ url, headers }, "Empty response");
    }
    if (res.status() >= 400) {
      const status = res.status();
      const screenshot = await screenshotPage(page);
      const error = new LoggableError({ url, headers, status }, "Error response");
      error.setScreenshot(screenshot);
      throw error;
    }
    const data = await res.body();
    const type = await imageType(data);
    if (!type) {
      throw new Error("Input is not a image");
    }
    return { name: `${randomUUID()}.${type.ext}`, data };
  } catch (cause) {
    throw new LoggableError({ url, headers }, "Fail to fetch image via browser", { cause });
  } finally {
    await page.close();
  }
}
