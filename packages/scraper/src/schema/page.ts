import { Kind, Type, TypeRegistry } from "@sinclair/typebox";

import type { Page } from "playwright";

const kind = "Page";

TypeRegistry.Set(kind, (_schema, value) => {
  if (typeof value !== "object") {
    return false;
  }
  const page = value as Page;
  return typeof page.goto === "function";
});

export const pageSchema = Type.Unsafe<Page>({ [Kind]: kind });
