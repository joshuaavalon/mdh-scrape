import { Type } from "@sinclair/typebox";
import { dateTimeSchema } from "./date-time.js";
import { fileSchema } from "./file.js";

import type { StaticEncode } from "@sinclair/typebox";

export const scrapedEpisodeSchema = Type.Object({
  airDate: dateTimeSchema,
  backdrop: Type.Optional(Type.Array(fileSchema)),
  banners: Type.Optional(Type.Array(fileSchema)),
  country: Type.String(),
  description: Type.Optional(Type.String()),
  language: Type.String(),
  logos: Type.Optional(Type.Array(fileSchema)),
  name: Type.String(),
  order: Type.Optional(Type.Number()),
  posters: Type.Optional(Type.Array(fileSchema)),
  rating: Type.Optional(Type.Number()),
  sortName: Type.String(),
  thumbnails: Type.Optional(Type.Array(fileSchema)),
  tvSeason: Type.String()
});

export type ScrapedEpisode = StaticEncode<typeof scrapedEpisodeSchema>;
