import type { ValueFunction } from "#type";

export function execValFn<Value, Input>(fn: ValueFunction<Value, Input>, input: Input): Value {
  return typeof fn === "function" ? fn(input) : fn;
}
