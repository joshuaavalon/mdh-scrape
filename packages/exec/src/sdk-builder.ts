import { initMdh } from "@media-data-hub/sdk";

import type { Logger } from "pino";
import type { InitMdhOptions, MediaDataHub } from "@media-data-hub/sdk";
import type { Builder } from "@mdhs/core";

export interface SdkBuilderOptions {
  loggerBuilder: Builder<Logger>;
  initMdh: Omit<InitMdhOptions, "logger">;
}

export class SdkBuilder implements Builder<Promise<MediaDataHub>> {
  private readonly loggerBuilder: Builder<Logger>;
  private readonly initMdh: InitMdhOptions;

  public constructor(opts: SdkBuilderOptions) {
    const { loggerBuilder, initMdh } = opts;
    this.loggerBuilder = loggerBuilder;
    this.initMdh = initMdh;
  }

  public async build(): Promise<MediaDataHub> {
    const logger = this.loggerBuilder.build();
    return await initMdh({ logger, ...this.initMdh });
  }
}
