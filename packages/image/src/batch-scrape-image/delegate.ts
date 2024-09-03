import type { ImageTypeResult } from "image-type";
import type { MdhTvEpisodeScraperEpisodeContext } from "@mdhs/core";

export interface BatchScrapeImageDelegate {
  (urls: string[], ctx: MdhTvEpisodeScraperEpisodeContext): Promise<ScrapeImageResult[]>;
}

export interface ScrapeImageResult {
  fileName: string;
  blob: Blob;
}

export interface DetectImageTypeDelegate {
  (buffer: Buffer): Promise<ImageTypeResult | undefined>;
}

export interface PostProcessImageDelegate {
  (buffer: Buffer): Promise<Buffer>;
}
