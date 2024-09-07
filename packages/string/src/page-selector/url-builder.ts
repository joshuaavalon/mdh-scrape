import type { Builder, EpFunc } from "@mdhs/core";

export interface PageUrlSelectorBuilderOptions {
  url: string;
  selector: EpFunc<string>;
}

export class PageUrlSelectorBuilder implements Builder<EpFunc<string>> {
  private readonly url: string;
  private readonly selector: EpFunc<string>;

  public constructor(opts: PageUrlSelectorBuilderOptions) {
    const { url, selector } = opts;
    this.url = url;
    this.selector = selector;
  }

  public build(): EpFunc<string> {
    return async ctx => {
      const { browser } = ctx;
      const page = await browser.newPage();
      await page.goto(this.url);
      return await this.selector({ ...ctx, page });
    };
  }
}
