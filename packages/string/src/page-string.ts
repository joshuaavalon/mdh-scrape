import { execValFunc } from "@mdhs/mdhsr";

import type { EpFunc, PageSelector, ValFunc } from "@mdhs/mdhsr";
import type { EpisodeContext } from "@mdhs/mdhsr/context";

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
