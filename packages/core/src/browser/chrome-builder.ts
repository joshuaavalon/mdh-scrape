import { chromium } from "playwright";

import type { LaunchOptions } from "playwright";
import type { Browser } from "playwright";
import type { Builder } from "#type";

export class ChromeBuilder implements Builder<Promise<Browser>> {
  private readonly opts: LaunchOptions;

  public constructor(opts: LaunchOptions) {
    this.opts = opts;
  }

  public async build(): Promise<Browser> {
    return await chromium.launch(this.opts);
  }

  public static withDefault(opts?: LaunchOptions): ChromeBuilder {
    const defaultOpts: LaunchOptions = {
      executablePath: "/usr/bin/chromium",
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"]
    };
    return new ChromeBuilder({ ...defaultOpts, ...opts });
  }
}
