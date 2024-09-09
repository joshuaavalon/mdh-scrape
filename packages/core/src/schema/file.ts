import { Type } from "@sinclair/typebox";

import { bufferSchema } from "./buffer.js";

export const fileSchema = Type.Object({
  name: Type.String(),
  data: Type.Transform(bufferSchema)
    .Decode(v => v.toString("base64"))
    .Encode(v => Buffer.from(v, "base64"))
});
