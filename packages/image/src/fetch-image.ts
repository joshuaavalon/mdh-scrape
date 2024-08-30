import { LoggableError } from "@joshuaavalon/mdh-scraper/error";
import { pageScreenshot } from "./page-screenshot.js";

import type { ScraperContext } from "@joshuaavalon/mdh-scraper";
import type { FetchImageDelegate } from "./batch-fetch-image.js";


interface FetchImageOptions {
  readonly method: "browser" | "fetch";
  readonly url: string;
  readonly headers?: Record<string, string>;
}

function mapHeaders(opts: FetchImageOptions): Record<string, string> {
  const { url, headers = {} } = opts;
  const referer = headers.referer ?? url;
  return { referer, ...headers };
}

async function fetchImageViaBrowser(ctx: ScraperContext, opts: FetchImageOptions): Promise<Buffer> {
  const { browser } = ctx;
  const { url } = opts;
  const page = await browser.newPage();
  const headers = mapHeaders(opts);
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
}

async function fetchImageViaFetch(opts: FetchImageOptions): Promise<Buffer> {
  const { url } = opts;
  const headers = mapHeaders(opts);
  try {
    const res = await fetch(url, { headers });
    const { status } = res;
    if (status >= 400) {
      const error = new LoggableError({ url, headers, status }, "Error response");
      throw error;
    }
    const body = await res.arrayBuffer();
    return Buffer.from(body);
  } catch (cause) {
    throw new LoggableError({ url, headers }, "Fail to fetch image via fetch", { cause });
  }
}


export async function fetchImage(ctx: ScraperContext, opts: FetchImageOptions): Promise<Buffer> {
  const { method } = opts;
  switch (method) {
    case "browser":
      return await fetchImageViaBrowser(ctx, opts);
    case "fetch":
      return await fetchImageViaFetch(opts);
    default:
      throw new LoggableError({ method }, "Unknown method for fetchImage");
  }
}

export function buildFetchImageDelegate(ctx: ScraperContext, opts: Omit<FetchImageOptions, "url">): FetchImageDelegate {
  return async function (url) {
    return await fetchImage(ctx, { ...opts, url });
  };
}
