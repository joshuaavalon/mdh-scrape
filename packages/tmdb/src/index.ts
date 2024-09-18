import { LoggableError, fetchImage } from "@mdhs/core";

import type { EpisodeScraperContext, EpisodeScraperEpisodeContext, EpisodeScraperPlugin, EpisodeScraperValueEventArgs } from "@mdhs/core";

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


const tmdbSymbol = Symbol("tmdbPluginResultCache");
function cacheId(seriesId: number, seasonNum: number, episodeNum: number): string {
  return `${seriesId}.${seasonNum}.${episodeNum}`;
}

function onScrapeValue<T>(opts: TmdbPluginOptions, mapper: (ep: TmdbEpisode) => Promise<T> | T): (...args: EpisodeScraperValueEventArgs<T>) => void {
  const { seriesId: seriesIdFn, seasonNum: seasonNumFn = 1, episodeNum: episodeNumFn = (_ctx, epCtx) => epCtx.metadata.num } = opts;
  return async (ctx, epCtx, result) => {
    const seriesId = typeof seriesIdFn === "function" ? await seriesIdFn(ctx, epCtx) : seriesIdFn;
    const seasonNum = typeof seasonNumFn === "function" ? await seasonNumFn(ctx, epCtx) : seasonNumFn;
    const episodeNum = typeof episodeNumFn === "function" ? await episodeNumFn(ctx, epCtx) : episodeNumFn;
    const json = await ctx.fetchTmdbApi(seriesId, seasonNum, episodeNum);
    result.value = await mapper(json);
  };
}


export interface TmdbPluginOptions {
  seriesId: number | ((ctx: EpisodeScraperContext, epCtx: EpisodeScraperEpisodeContext) => Promise<number>);
  seasonNum?: number | ((ctx: EpisodeScraperContext, epCtx: EpisodeScraperEpisodeContext) => Promise<number>);
  episodeNum?: number | ((ctx: EpisodeScraperContext, epCtx: EpisodeScraperEpisodeContext) => Promise<number>);
  apiReadAccessToken: string;

  scrapeName?: boolean;
  scrapeDescription?: boolean;
  scrapePosters?: boolean;
}


export const tmdbPlugin: EpisodeScraperPlugin<TmdbPluginOptions> = async (scraper, opts) => {
  const {
    apiReadAccessToken,
    scrapeName = true,
    scrapeDescription = true,
    scrapePosters = true
  } = opts;
  scraper.on("init", ctx => {
    ctx[tmdbSymbol] = {};
    ctx.fetchTmdbApi = async (seriesId, seasonNum, episodeNum) => {
      const id = cacheId(seriesId, seasonNum, episodeNum);
      if (ctx[tmdbSymbol][id]) {
        return ctx[tmdbSymbol][id];
      }
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
      const json = await res.json() as TmdbEpisode;
      ctx[tmdbSymbol][id] = json;
      return json;
    };
  });
  if (scrapeName) {
    scraper.on("scrapeName", onScrapeValue(opts, e => e.name));
  }
  if (scrapeDescription) {
    scraper.on("scrapeDescription", onScrapeValue(opts, e => e.overview));
  }
  if (scrapePosters) {
    scraper.on("scrapePosters", onScrapeValue(opts, async e => [await fetchImage(`https://image.tmdb.org/t/p/original${e.still_path}`)]));
  }
};


declare module "@mdhs/core" {
  interface EpisodeScraperContext {
    [tmdbSymbol]: Record<string, TmdbEpisode>;
    fetchTmdbApi(seriesId: number, seasonNum: number, episodeNum: number): Promise<TmdbEpisode>;
  }
}
