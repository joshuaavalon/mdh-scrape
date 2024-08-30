import { Type } from "@sinclair/typebox";
import { pageSchema } from "#schema";
import { scraperContextSchema } from "./scraper-context.js";

import type { Static } from "@sinclair/typebox";

export const episodeContextSchema = Type.Intersect([
  scraperContextSchema,
  Type.Object({
    page: Type.Readonly(pageSchema),
    ep: Type.Readonly(Type.Object({
      num: Type.Readonly(Type.Integer({ minimum: 1 })),
      padNum: Type.Readonly(Type.String({ minLength: 1 }))
    }))
  })
]);

/**
 * Readonly context per episode
 */
export type EpisodeContext = Static<typeof episodeContextSchema>;
