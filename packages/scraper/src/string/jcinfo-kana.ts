import type { EpisodeStringStrategy } from "#type";


export function jcinfoKana(input: string): EpisodeStringStrategy {
  return async function jcinfoKanaStrategy(ctx): Promise<string> {
    const { browser } = ctx;
    const page = await browser.newPage();
    try {
      await page.goto("https://www.jcinfo.net/ja/tools/kana");
      await page.fill("#input_text", input);
      await page.locator("label#is_katakana").click();
      await page.locator(".btn-primary").click();
      await page.waitForLoadState("load");
      const results = await page.locator("._result").allTextContents();
      if (results.length !== 3) {
        throw new Error("Cannot resolve Kana");
      }
      return results[2];
    } finally {
      await page.close();
    }
  };
}
