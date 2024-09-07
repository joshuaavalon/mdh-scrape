import assert from "node:assert/strict";
import { LoggableError } from "#error";

import type { Builder } from "#type";

function isValidValue(value: unknown): boolean {
  return typeof value === "function";
}

export interface Func<T, U extends unknown[]> {
  (...args: U): Promise<T>;
}

export class ChainFuncBuilder<T, U extends unknown[]> implements Builder<Func<T, U>> {
  private chains: Func<T, U>[] = [];

  public constructor(chains: Func<T, U>[] = []) {
    assert.ok(Array.isArray(chains));
    assert.ok(chains.every(isValidValue));
    this.chains = chains;
  }

  public chain(chain: Func<T, U>): this {
    assert.ok(isValidValue(chain));
    this.chains.push(chain);
    return this;
  }

  public append(chains: Func<T, U>[]): this {
    assert.ok(Array.isArray(chains));
    assert.ok(chains.every(isValidValue));
    this.chains = { ...this.chains, ...chains };
    return this;
  }

  public build(): Func<T, U> {
    const chains = [...this.chains];
    return async (...args) => {
      let error = new LoggableError({ }, "No chain(s) func exists");
      for (const chain of chains) {
        try {
          return await chain(...args);
        } catch (cause) {
          if (cause instanceof Error) {
            cause.cause = error;
          }
          error = new LoggableError({ }, "Chain func failed", { cause });
        }
      }
      throw error;
    };
  }
}
