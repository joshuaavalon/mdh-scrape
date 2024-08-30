import type { ScraperContext } from "./scraper-context.js";

import type { Page } from "playwright";

/**
 * Readonly context per episode
 */
export interface EpisodeContext extends ScraperContext {
  readonly page: Page;
  readonly ep: {

    /**
     * Minimum value is `1`
     */
    readonly num: number;
    readonly padNum: string;
  };
}
