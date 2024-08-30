import { Kind, Type, TypeRegistry } from "@sinclair/typebox";

import type { Logger } from "pino";

const kind = "Logger";

TypeRegistry.Set(kind, (_schema, value) => {
  if (typeof value !== "object") {
    return false;
  }
  const logger = value as Logger;
  return typeof logger.debug === "function"
    && typeof logger.info === "function"
    && typeof logger.warn === "function"
    && typeof logger.error === "function";
});

export const loggerSchema = Type.Unsafe<Logger>({ [Kind]: kind });
