import type { DateTime } from "luxon";
import type { Builder, EpFunc } from "@mdhs/core";


export interface DateSpanBuilderOptions {
  baseDate: DateTime;
  baseEp: number;
  span?: number;
}

export class DateSpanBuilder implements Builder<EpFunc<DateTime<true>>> {
  private readonly baseDate: DateTime<true>;
  private readonly baseEp: number;
  private readonly span: number;

  public constructor(opts: DateSpanBuilderOptions) {
    const { baseDate, baseEp, span = 7 } = opts;
    if (!baseDate.isValid) {
      throw new Error("baseDate is not valid");
    }
    if (!Number.isInteger(baseEp)) {
      throw new Error("baseEp is not integer");
    }
    if (!Number.isInteger(span)) {
      throw new Error("span is not integer");
    }
    this.baseDate = baseDate;
    this.baseEp = baseEp;
    this.span = span;
  }

  public build(): EpFunc<DateTime<true>> {
    return async ctx => {
      const { epInfo } = ctx;
      return this.baseDate.plus({ days: (epInfo.num - this.baseEp + 1) * this.span }).setZone("utc") as DateTime<true>;
    };
  }
}
