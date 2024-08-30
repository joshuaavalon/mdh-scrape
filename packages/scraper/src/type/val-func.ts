// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type ValFunc<Value, Input> = Value extends Function ? never : Value | ((input: Input) => Value);
