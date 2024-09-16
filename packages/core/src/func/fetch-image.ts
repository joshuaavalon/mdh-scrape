import { randomUUID } from "node:crypto";
import imageType from "image-type";
import { LoggableError } from "#error";

import type { File } from "#schema";


export async function fetchImage(url: string, referer?: string): Promise<File> {
  const headers = referer ? { referer } : { referer: url };
  try {
    const res = await fetch(url, { headers });
    const { status } = res;
    if (status >= 400) {
      const error = new LoggableError({ url, headers, status }, "Error response");
      throw error;
    }
    const body = await res.arrayBuffer();
    const data = Buffer.from(body);
    const type = await imageType(data);
    if (!type) {
      throw new Error("Input is not a image");
    }
    return { name: `${randomUUID()}.${type.ext}`, data };
  } catch (cause) {
    throw new LoggableError({ url, headers }, "Fail to fetch image via fetch", { cause });
  }
}
