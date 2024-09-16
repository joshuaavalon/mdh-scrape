import { LoggableError } from "#error";

import type { ScrapedEpisode, Windmill } from "#schema";
import type { MediaDataHub, TvEpisodeRecord } from "@media-data-hub/sdk";
import { DateTime } from "luxon";


async function uploadEpisode(mdh: MediaDataHub, episodes: ScrapedEpisode): Promise<TvEpisodeRecord> {
  const data = new FormData();
  for (const [key, value] of Object.entries(episodes)) {
    if (typeof value === "undefined") {
      continue;
    }
    if (Array.isArray(value)) {
      for (const v of value) {
        data.append(key, new Blob([v.data]), v.name);
      }
    } else if (value instanceof DateTime) {
      data.append(key, value.toISO());
    } else {
      data.append(key, value);
    }
  }
  const record = await mdh.c("tvEpisode").create(data);
  for (const image of record.posters) {
    const url = mdh.getAdminThumbUrl(record, image);
    await fetch(url);
  }
  for (const image of record.thumbnails) {
    const url = mdh.getAdminThumbUrl(record, image);
    await fetch(url);
  }
  for (const image of record.backdrop) {
    const url = mdh.getAdminThumbUrl(record, image);
    await fetch(url);
  }
  for (const image of record.logos) {
    const url = mdh.getAdminThumbUrl(record, image);
    await fetch(url);
  }
  for (const image of record.banners) {
    const url = mdh.getAdminThumbUrl(record, image);
    await fetch(url);
  }
  return record;
}

export async function uploadEpisodes(mdh: MediaDataHub, episodes: (LoggableError | ScrapedEpisode)[]): Promise<Windmill.RenderAll> {
  if (episodes.some(ep => ep instanceof LoggableError)) {
    const errors: LoggableError[] = [];
    const eps: ScrapedEpisode[] = [];
    for (const ep of episodes) {
      if (ep instanceof LoggableError) {
        errors.push(ep);
      } else {
        const { posters, backdrop, banners, logos, thumbnails, ...others } = ep;
        eps.push(others);
      }
    }
    return {
      render_all: [
        { "table-row-object": eps },
        ...errors.map(error => ({ error: { name: "LoggableError", message: error.message } }))
      ]
    };
  }
  const episodes2 = episodes as ScrapedEpisode[];
  const records = await Promise.all(episodes2.map(e => uploadEpisode(mdh, e)));
  return { render_all: [{ "table-row-object": records }] };
}
