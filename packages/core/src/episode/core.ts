import type {} from "@sinclair/typebox";

import type { TvEpisodeRecord } from "@media-data-hub/sdk";
interface TvEpisodeRecord {
  airDate: IsoDateString;
  backdrop?: string[];
  banners?: string[];
  country: RecordIdString;
  description?: string;
  language: RecordIdString;
  logos?: string[];
  name: string;
  order?: number;
  posters?: string[];
  rating?: number;
  sortName: string;
  thumbnails?: string[];
  tvSeason: RecordIdString;
}

export class Core {

}
