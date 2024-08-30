import { execValFunc } from "@joshuaavalon/mdh-scraper";

import type { EpFunc, PageSelector, ValFunc } from "@joshuaavalon/mdh-scraper";
import type { EpisodeContext } from "@joshuaavalon/mdh-scraper/context";

export function pageString(
  urlFn: ValFunc<string, EpisodeContext>,
  selector: PageSelector<string, EpisodeContext>
): EpFunc<string> {
  return async function pageStringStrategy(ctx) {
    const { browser } = ctx;
    const page = await browser.newPage();
    try {
      const fromUrl = execValFunc(urlFn, ctx);
      await page.goto(fromUrl);
      return await selector(page, ctx);
    } finally {
      await page.close();
    }
  };
}
