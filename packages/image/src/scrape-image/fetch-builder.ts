import { LoggableError } from "@mdhs/core";

import type { Builder } from "@mdhs/core";
import type { ScrapeImageDelegate } from "./delegate.js";

export class FetchScrapeImageBuilder implements Builder<ScrapeImageDelegate> {
  public build(): ScrapeImageDelegate {
    return async (url, ctx) => {
      const referer = ctx.page.url();
      const headers = { referer };
      try {
        const res = await fetch(url, { headers });
        const { status } = res;
        if (status >= 400) {
          const error = new LoggableError({ url, headers, status }, "Error response");
          throw error;
        }
        const body = await res.arrayBuffer();
        return Buffer.from(body);
      } catch (cause) {
        throw new LoggableError({ url, headers }, "Fail to fetch image via fetch", { cause });
      }
    };
  }
}
