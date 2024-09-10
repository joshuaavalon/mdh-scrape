import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import type { Static, TObject, TSchema } from "@sinclair/typebox";

export interface ScraperOptions<T extends Record<string, TSchema>> {
  schema: T;
}

export class Scraper<T extends Record<string, TSchema>> {
  private readonly schema: T;
  private readonly values: { [U in keyof T]: Static<T[U]> };

  public constructor(opts: ScraperOptions<T>) {
    const { schema } = opts;
    this.schema = schema;
    this.values = {} as any;
  }

  public set<U extends keyof T>(key: U, value: Static<T[U]>): this {
    if (!Value.Check(this.schema[key], value)) {
      const errors = Value.Errors(this.schema[key], value);
      // TODO: Error message
      throw new Error();
    }
    this.values[key] = value;
    return this;
  }

  public build(): Static<TObject<T>> {
    const schema = Type.Object(this.schema);
    if (!Value.Check(schema, this.values)) {
      const errors = Value.Errors(schema, this.values);
      // TODO: Error message
      throw new Error();
    }
    return this.values;
  }
}
