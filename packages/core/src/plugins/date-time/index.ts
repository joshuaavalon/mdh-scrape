import type { DateTime } from "luxon";
import type { EpisodeScraperPlugin } from "#episode";

export interface DateTimePluginOptions {
  span?: number;
  mapping: Record<number, DateTime>;
}

export const dateTimePlugin: EpisodeScraperPlugin<DateTimePluginOptions> = async (scraper, opts) => {
  const { mapping, span = 7 } = opts;
  const epNums = Object.keys(mapping)
    .map(ep => Number.parseInt(ep))
    .filter(ep => Number.isSafeInteger(ep))
    .toSorted();
  scraper.on("scrapeAirDate", async (_ctx, epCtx, result) => {
    const epNum = epCtx.metadata.num;
    if (mapping[epNum]) {
      result.value = mapping[epNum];
      return;
    }
    const nearestEp = epNums.findLast(epNo => epNo <= epNum) ?? -1;
    if (nearestEp <= 0) {
      return;
    }
    const dateTime = mapping[nearestEp];
    result.value = dateTime.plus({ days: (epNum - nearestEp) * span });
  });
};

