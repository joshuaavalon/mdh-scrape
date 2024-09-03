import assert from "node:assert/strict";
import { LoggableError } from "#error";

import type { EpFunc } from "#episode";
import type { Builder } from "#type";

function isValidKey(key: unknown): boolean {
  if (typeof key !== "string") {
    return false;
  }
  const num = Number.parseInt(key);
  return Number.isSafeInteger(num) && num > 0;
}

function isValidValue(value: unknown): boolean {
  return typeof value === "function";
}


export class NearestEpFuncBuilder<T> implements Builder<EpFunc<T>> {
  private mapping: Record<number, EpFunc<T>> = {};

  public constructor(mapping: Record<number, EpFunc<T>> = {}) {
    assert.ok(typeof mapping === "object");
    assert.ok(Object.keys(mapping).every(isValidKey));
    assert.ok(Object.values(mapping).every(isValidValue));
    this.mapping = mapping;
  }

  public setMapping(mapping: Record<number, EpFunc<T>>): this {
    assert.ok(typeof mapping === "object");
    assert.ok(Object.keys(mapping).every(isValidKey));
    assert.ok(Object.values(mapping).every(isValidValue));
    this.mapping = mapping;
    return this;
  }

  public appendMapping(mapping: Record<number, EpFunc<T>>): this {
    assert.ok(typeof mapping === "object");
    assert.ok(Object.keys(mapping).every(isValidKey));
    assert.ok(Object.values(mapping).every(isValidValue));
    this.mapping = { ...this.mapping, ...mapping };
    return this;
  }

  public build(): EpFunc<T> {
    const mapping = { ...this.mapping };
    const epNum = Object.keys(mapping)
      .map(ep => Number.parseInt(ep))
      .filter(ep => ep > 0 && Number.isSafeInteger(ep))
      .toSorted();

    return ctx => {
      const { epInfo } = ctx;
      if (mapping[epInfo.num]) {
        return mapping[epInfo.num](ctx);
      }
      const nearestEp = epNum.findLast(epNo => epNo <= epInfo.num) ?? -1;
      if (nearestEp <= 0) {
        throw new LoggableError({ epInfo, epNum }, "Cannot find nearest episode number");
      }
      return mapping[nearestEp](ctx);
    };
  }
}
