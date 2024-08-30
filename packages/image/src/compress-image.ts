import sharp from "sharp";
import imageType from "image-type";

import type { ImageTypeResult } from "image-type";

export interface CompressImageResult {
  type: ImageTypeResult;
  data: Uint8Array;
}

export async function compressImage(input: Buffer): Promise<CompressImageResult> {
  const type = await imageType(input);
  if (!type) {
    throw new Error("Not a image");
  }
  if (type.mime === "image/webp" || type.mime === "image/jpeg") {
    return { data: input, type };
  }
  const data = await sharp(input)
    .webp({ lossless: true, force: true, effort: 6 })
    .toBuffer();
  const newType = await imageType(data);
  if (!newType) {
    throw new Error("Not a image (new)");
  }
  return { type: newType, data };
}
