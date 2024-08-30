import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { scraperContextSchema } from "@joshuaavalon/mdh-scraper/context";
import { LoggableError } from "@joshuaavalon/mdh-scraper/error";
import { pageScreenshot } from "./page-screenshot.js";

import type { Static } from "@sinclair/typebox";
import type { ScraperContext } from "@joshuaavalon/mdh-scraper";


const fetchImageOptionsSchema = Type.Object({
  method: Type.Readonly(Type.Union([Type.Const("browser" as const), Type.Const("fetch" as const)])),
  url: Type.Readonly(Type.String()),
  headers: Type.ReadonlyOptional(Type.Record(Type.String(), Type.String()))
});

type FetchImageOptions = Static<typeof fetchImageOptionsSchema>;

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
  Value.Assert(scraperContextSchema, ctx);
  Value.Assert(fetchImageOptionsSchema, opts);
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
