import { Type } from "@sinclair/typebox";
import { bufferSchema } from "./buffer.js";

import type { StaticEncode } from "@sinclair/typebox";

export const fileSchema = Type.Object({
  name: Type.String(),
  data: Type.Transform(bufferSchema)
    .Decode(v => v.toString("base64"))
    .Encode(v => Buffer.from(v, "base64"))
});

export type File = StaticEncode<typeof fileSchema>;

