import { compressImage } from "#func";

import type { EpisodeScraperPlugin } from "#episode";


export interface FormatPluginOptions {
  postScrapeName?: boolean;
  preScrapeSortName?: boolean;
  postScrapeSortName?: boolean;
  postScrapeDescription?: boolean;
  postScrapePosters?: boolean;
}

export const formatPlugin: EpisodeScraperPlugin<FormatPluginOptions> = async (scraper, opts) => {
  const {
    postScrapeName = true,
    preScrapeSortName = true,
    postScrapeSortName = true,
    postScrapeDescription = true,
    postScrapePosters = true
  } = opts;
  if (postScrapeName) {
    scraper.on("postScrapeName", (_ctx, epCtx) => {
      epCtx.result.name = epCtx.result.name?.normalize("NFKC")
        .replaceAll("...", "…")
        .trim()
        .replaceAll(/\s+/gu, " ");
    });
  }
  if (preScrapeSortName) {
    scraper.on("preScrapeSortName", (_ctx, epCtx) => {
      epCtx.result.sortName = epCtx.result.name?.replaceAll(/[-()〈〉、!?！？。・♡：]/gu, " ");
    });
  }
  if (postScrapeSortName) {
    scraper.on("postScrapeSortName", (_ctx, epCtx) => {
      epCtx.result.sortName = epCtx.result.sortName?.trim()
        .replaceAll(/\s+/gu, " ");
    });
  }
  if (postScrapeDescription) {
    scraper.on("postScrapeDescription", (_ctx, epCtx) => {
      epCtx.result.description = epCtx.result.description?.normalize("NFKC")
        .replaceAll("...", "…")
        .trim()
        .replace(/^ *(?<val>\S+)/gmu, "$<val>")
        .replace(/(?<val>\S+) *$/gmu, "$<val>")
        .replaceAll(/、\s+/gu, "、")
        .replaceAll(/\n{3,}/gu, "\n\n")
        .replaceAll("\n", "<br/>\n")
        .replaceAll("</h3><br/>\n", "</h3>\n")
        .replaceAll("</h2><br/>\n", "</h2>\n")
        .replaceAll("</h1><br/>\n", "</h1>\n");
    });
    if (postScrapePosters) {
      scraper.on("postScrapePosters", async (_ctx, epCtx) => {
        const { posters = [] } = epCtx.result;
        await Promise.all(posters.map(async poster => {
          poster.data = await compressImage(poster.data);
        }));
        epCtx.result.posters = posters;
      });
    }
  }
};

