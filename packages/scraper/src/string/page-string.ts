import { execValFn } from "#utils";

import type { EpisodeContext } from "#context";
import type { EpisodeStringStrategy, PageSelector, ValueFunction } from "#type";

export function pageString(
  urlFn: ValueFunction<string, EpisodeContext>,
  selector: PageSelector<string, EpisodeContext>
): EpisodeStringStrategy {
  return async function pageStringStrategy(ctx) {
    const { browser } = ctx;
    const page = await browser.newPage();
    try {
      const fromUrl = execValFn(urlFn, ctx);
      await page.goto(fromUrl);
      return await selector(page, ctx);
    } finally {
      await page.close();
    }
  };
}
