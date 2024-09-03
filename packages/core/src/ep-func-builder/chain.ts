import assert from "node:assert/strict";
import { LoggableError } from "#error";

import type { EpFunc } from "#episode";
import type { Builder } from "#type";

function isValidValue(value: unknown): boolean {
  return typeof value === "function";
}


export class ChainEpFuncBuilder<T> implements Builder<EpFunc<T>> {
  private chains: EpFunc<T>[] = [];

  public constructor(chains: EpFunc<T>[] = []) {
    assert.ok(Array.isArray(chains));
    assert.ok(chains.every(isValidValue));
    this.chains = chains;
  }

  public chain(chain: EpFunc<T>): this {
    assert.ok(isValidValue(chain));
    this.chains.push(chain);
    return this;
  }

  public append(chains: EpFunc<T>[]): this {
    assert.ok(Array.isArray(chains));
    assert.ok(chains.every(isValidValue));
    this.chains = { ...this.chains, ...chains };
    return this;
  }

  public build(): EpFunc<T> {
    const chains = [...this.chains];
    return ctx => {
      const { epInfo } = ctx;
      let error = new LoggableError({ epInfo }, "No chain(s) EpFunc exists");
      for (const chain of chains) {
        try {
          return chain(ctx);
        } catch (cause) {
          if (cause instanceof Error) {
            cause.cause = error;
          }
          error = new LoggableError({ epInfo }, "Chain epFunc failed", { cause });
        }
      }
      throw error;
    };
  }
}
