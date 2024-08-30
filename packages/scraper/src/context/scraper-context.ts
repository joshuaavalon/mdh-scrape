import type { Logger } from "pino";
import type { Browser } from "playwright";

/**
 * Readonly context for scraper
 */
export interface ScraperContext {
  readonly browser: Browser;
  readonly logger: Logger;
}
