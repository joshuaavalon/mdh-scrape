import sharp from "sharp";
import imageType from "image-type";

export async function compressImage(input: Buffer): Promise<Buffer> {
  const type = await imageType(input);
  if (!type) {
    throw new Error("Input is not a image");
  }
  if (type.mime === "image/webp" || type.mime === "image/jpeg") {
    return input;
  }
  return await sharp(input)
    .webp({ lossless: true, force: true, effort: 6 })
    .toBuffer();
}
