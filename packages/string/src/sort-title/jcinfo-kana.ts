import assert from "node:assert/strict";
import { LoggableError } from "@mdhs/core";

import type { Builder, EpFunc } from "@mdhs/core";


export class JcinfoKanaBuilder implements Builder<EpFunc<string>> {
  private url = "https://www.jcinfo.net/ja/tools/kana";
  private preProcess?: (from: string) => string;
  private postProcess?: (from: string) => string;

  public setPreProcess(preProcess: (from: string) => string): this {
    assert.ok(typeof preProcess === "function");
    this.preProcess = preProcess;
    return this;
  }

  public setPostProcess(postProcess: (from: string) => string): this {
    assert.ok(typeof postProcess === "function");
    this.postProcess = postProcess;
    return this;
  }

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
        await page.goto(this.url);
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

  public static withDefault(): JcinfoKanaBuilder {
    const builder = new JcinfoKanaBuilder();
    return builder
      .setPreProcess(v => v.replaceAll(/[-()〈〉、!?！？。・♡：]/gu, " "))
      .setPostProcess(v => v.trim().replaceAll(/\s+/gu, " "));
  }
}
