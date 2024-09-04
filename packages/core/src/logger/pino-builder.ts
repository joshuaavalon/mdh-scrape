import { pino } from "pino";
import pinoStd from "pino-std-serializers";

import type { Logger, LoggerOptions } from "pino";
import type { SerializedError } from "pino-std-serializers";
import type { Builder } from "#type";


const filterError = function (error: SerializedError): SerializedError {
  const { type, message, stack, cause } = error;
  return { type, message, stack, cause: cause ? filterError(cause) : undefined } as SerializedError;
};

const errorSerializer = pinoStd.wrapErrorSerializer(err => filterError(pinoStd.errWithCause(err.raw)));

export class PinoLoggerBuilder implements Builder<Logger> {
  private readonly opts: LoggerOptions;

  public constructor(opts: LoggerOptions) {
    this.opts = opts;
  }

  public build(): Logger {
    return pino(this.opts);
  }

  public static withDefault(opts?: LoggerOptions): PinoLoggerBuilder {
    const defaultOpts: LoggerOptions = {
      level: "info",
      transport: {
        target: "pino-pretty",
        options: { colorize: true }
      },
      serializers: { err: errorSerializer }
    };
    return new PinoLoggerBuilder({ ...defaultOpts, ...opts });
  }
}
