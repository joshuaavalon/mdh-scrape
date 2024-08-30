import { Type } from "@sinclair/typebox";
import { browserSchema, loggerSchema } from "#schema";

import type { Static } from "@sinclair/typebox";

export const scraperContextSchema = Type.Object({
  browser: Type.Readonly(browserSchema),
  logger: Type.Readonly(loggerSchema)
});

/**
 * Readonly context for scraper
 */
export type ScraperContext = Static<typeof scraperContextSchema>;
