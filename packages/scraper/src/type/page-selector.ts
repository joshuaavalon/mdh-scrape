import type { Page } from "playwright";
import type { ScraperContext } from "#context";

export interface PageSelector<T, Context extends ScraperContext = ScraperContext> {
  (page: Page, ctx: Context): Promise<T>;
}
