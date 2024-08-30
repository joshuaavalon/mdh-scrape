import { compressImage } from "./compress-image.js";

export type FetchImageDelegate = (url: string) => Promise<Buffer>;
export interface FetchImageResult {
  fileName: string;
  blob: Blob;
}

export async function batchFetchImage(delegate: FetchImageDelegate, imageUrls: string[]): Promise<FetchImageResult[]> {
  return await Promise.all(imageUrls.map(async (imageUrl, i) => {
    const buffer = await delegate(imageUrl);
    const { data, type } = await compressImage(buffer);
    return { fileName: `${i}.${type.ext}`, blob: new Blob([data]) };
  }));
}
