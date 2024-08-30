import type { ValFunc } from "#type";

export function execValFunc<Value, Input>(fn: ValFunc<Value, Input>, input: Input): Value {
  return typeof fn === "function" ? fn(input) : fn;
}
