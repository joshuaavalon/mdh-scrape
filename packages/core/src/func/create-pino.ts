import { pino } from "pino";
import pinoStd from "pino-std-serializers";

import type { Logger, LoggerOptions } from "pino";
import type { SerializedError } from "pino-std-serializers";


const filterError = function (error: SerializedError): SerializedError {
  const { type, message, stack, cause } = error;
  return { type, message, stack, cause: cause ? filterError(cause) : undefined } as SerializedError;
};

const errorSerializer = pinoStd.wrapErrorSerializer(err => filterError(pinoStd.errWithCause(err.raw)));


export function createPino(opts?: LoggerOptions): Logger {
  const defaultOpts: LoggerOptions = {
    level: "info",
    transport: {
      target: "pino-pretty",
      options: { colorize: true }
    },
    redact: ["result.*[*].data"],
    serializers: { err: errorSerializer }
  };
  return pino({ ...defaultOpts, ...opts });
}
