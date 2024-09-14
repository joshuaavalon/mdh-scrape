import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { LoggableError } from "#error";

import type { Static, TObject, TSchema } from "@sinclair/typebox";

export interface ValueBuilderOptions<T extends Record<string, TSchema>> {
  schema: T;
}

export class ValueBuilder<T extends Record<string, TSchema>> {
  private readonly schema: T;
  private readonly values: { [U in keyof T]: Static<T[U]> };

  public constructor(opts: ValueBuilderOptions<T>) {
    const { schema } = opts;
    this.schema = schema;
    this.values = {} as any;
  }

  public set<U extends keyof T>(key: U, value: Static<T[U]>): this {
    if (!Value.Check(this.schema[key], value)) {
      const errors = Value.Errors(this.schema[key], value);
      throw LoggableError.fromValidation(errors);
    }
    this.values[key] = value;
    return this;
  }

  public build(): Static<TObject<T>> {
    const schema = Type.Object(this.schema);
    if (!Value.Check(schema, this.values)) {
      const errors = Value.Errors(schema, this.values);
      throw LoggableError.fromValidation(errors);
    }
    return this.values;
  }
}
