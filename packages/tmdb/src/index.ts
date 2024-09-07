import { LoggableError } from "@mdhs/core";

/* eslint-disable @typescript-eslint/naming-convention */
export interface TmdbEpisode {
  air_date: string;
  episode_number: number;
  name: string;
  overview: string;
  id: number;
  season_number: number;
  still_path: string;
}
/* eslint-enable @typescript-eslint/naming-convention */


export interface SelectEpisodeFromTmdbOptions {
  seriesId: number;
  seasonNum: number;
  episodeNum: number;
  apiReadAccessToken: string;
}

export async function selectEpisodeFromTmdb(opts: SelectEpisodeFromTmdbOptions): Promise<TmdbEpisode> {
  const { seriesId, seasonNum, episodeNum, apiReadAccessToken } = opts;
  const url = `https://api.themoviedb.org/3/tv/${seriesId}/season/${seasonNum}/episode/${episodeNum}?language=ja`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${apiReadAccessToken}`
    }
  });
  if (res.status !== 200) {
    throw new LoggableError({ json: await res.json(), status: res.status }, "");
  }
  return await res.json() as TmdbEpisode;
}
