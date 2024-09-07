import { firefox } from "playwright";

import type { LaunchOptions } from "playwright";
import type { Browser } from "playwright";
import type { Builder } from "@mdhs/core";

export class FirefoxBuilder implements Builder<Promise<Browser>> {
  private readonly opts: LaunchOptions;

  public constructor(opts: LaunchOptions) {
    this.opts = opts;
  }

  public async build(): Promise<Browser> {
    return await firefox.launch(this.opts);
  }
}
