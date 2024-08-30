import { Kind, Type, TypeRegistry } from "@sinclair/typebox";

import type { Browser } from "playwright";

const kind = "Browser";

TypeRegistry.Set(kind, (_schema, value) => {
  if (typeof value !== "object") {
    return false;
  }
  const browser = value as Browser;
  return typeof browser.browserType === "function";
});

export const browserSchema = Type.Unsafe<Browser>({ [Kind]: kind });
