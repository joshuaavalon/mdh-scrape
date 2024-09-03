import assert from "node:assert/strict";
import { LoggableError } from "@mdhs/core";

import type { Builder, EpFunc } from "@mdhs/core";


export class JcinfoKanaBuilder implements Builder<EpFunc<string>> {
  private url = "https://www.jcinfo.net/ja/tools/kana";

  public setUrl(url: string): this {
    assert.ok(typeof url === "string");
    this.url = url;
    return this;
  }

  public build(): EpFunc<string> {
    return async ctx => {
      const { browser, record, epInfo } = ctx;
      const { name } = record;
      if (!name) {
        throw new LoggableError({ record, epInfo }, "Name is empty");
      }
      const page = await browser.newPage();
      try {
        await page.goto("https://www.jcinfo.net/ja/tools/kana");
        await page.fill("#input_text", name);
        await page.locator("label#is_katakana").click();
        await page.locator(".btn-primary").click();
        await page.waitForLoadState("load");
        const results = await page.locator("._result").allTextContents();
        if (results.length !== 3) {
          throw new LoggableError({ record, epInfo }, "Cannot resolve Kana");
        }
        return results[2].replaceAll("ヴ", "ゔ");
      } finally {
        await page.close();
      }
    };
  }
}
