import assert from "node:assert/strict";
import imageType from "image-type";
import { LoggableError } from "@mdhs/core";
import { compressImage } from "#func";

import type { Builder } from "@mdhs/core";
import type { ScrapeImageDelegate } from "#scrape-image";
import type { BatchScrapeImageDelegate, DetectImageTypeDelegate, PostProcessImageDelegate } from "./delegate.js";

export class BatchScrapeImageBuilder implements Builder<BatchScrapeImageDelegate> {
  private scrapeImage?: ScrapeImageDelegate;
  private detectImageType?: DetectImageTypeDelegate;
  private postProcessImage?: PostProcessImageDelegate;

  public setScrapeImageDelegate(scrapeImage: ScrapeImageDelegate): this {
    assert.ok(typeof scrapeImage === "function");
    this.scrapeImage = scrapeImage;
    return this;
  }

  public setDetectImageTypeDelegate(detectImageType: DetectImageTypeDelegate): this {
    assert.ok(typeof detectImageType === "function");
    this.detectImageType = detectImageType;
    return this;
  }


  public setPostProcessImageDelegate(postProcessImage: PostProcessImageDelegate): this {
    assert.ok(typeof postProcessImage === "function");
    this.postProcessImage = postProcessImage;
    return this;
  }

  public build(): BatchScrapeImageDelegate {
    const scrapeImage = this.scrapeImage;
    const detectImageType = this.detectImageType;
    const postProcessImage = this.postProcessImage;
    assert.ok(typeof scrapeImage === "function");
    assert.ok(typeof detectImageType === "function");
    assert.ok(typeof postProcessImage === "function");
    return async (urls, ctx) => await Promise.all(urls.map(async (url, i) => {
      const { epInfo } = ctx;
      const buffer = await scrapeImage(url, ctx);
      const imageType = await detectImageType(buffer);
      if (!imageType) {
        throw new LoggableError({ url, epInfo }, "Input is not a image");
      }
      const newBuffer = await postProcessImage(buffer);
      const newImageType = await detectImageType(buffer);
      if (!newImageType) {
        throw new LoggableError({ url, epInfo, imageType }, "Post-process output is not a image");
      }
      return { fileName: `${i}.${newImageType.ext}`, blob: new Blob([newBuffer]) };
    }));
  }

  public static withDefault(scrapeImage: ScrapeImageDelegate): BatchScrapeImageBuilder {
    return new BatchScrapeImageBuilder()
      .setScrapeImageDelegate(scrapeImage)
      .setDetectImageTypeDelegate(imageType)
      .setPostProcessImageDelegate(compressImage);
  }
}
