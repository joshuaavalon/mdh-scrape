import sharp from "sharp";

import type { Page } from "playwright";

export async function pageScreenshot(page: Page): Promise<Buffer> {
  const buffer = await page.screenshot({ fullPage: true });
  return await sharp(buffer)
    .resize({
      width: 720,
      fit: sharp.fit.inside,
      withoutEnlargement: true
    })
    .webp()
    .toBuffer();
}
