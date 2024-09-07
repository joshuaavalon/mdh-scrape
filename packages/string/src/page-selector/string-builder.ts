import type { Locator } from "playwright";
import type { Builder, EpFunc, MdhTvEpisodeScraperEpisodeContext } from "@mdhs/core";

export interface PageSelectorBuilderOptions {
  rootSelector: EpFunc<Locator>;
  valueSelector: (locator: Locator, ctx: MdhTvEpisodeScraperEpisodeContext) => Promise<string>;
  validate: (from: string) => Error | null;
  postProcess: (from: string) => string;
}

function isBlank(value: string): boolean {
  return !value || /^\s*$/u.test(value);
}


export class PageSelectorBuilder implements Builder<EpFunc<string>> {
  private readonly rootSelector: EpFunc<Locator>;
  private readonly valueSelector: (locator: Locator, ctx: MdhTvEpisodeScraperEpisodeContext) => Promise<string>;
  private readonly validate: (from: string) => Error | null;
  private readonly postProcess: (from: string) => string;

  public constructor(opts: PageSelectorBuilderOptions) {
    const { rootSelector, valueSelector, validate, postProcess } = opts;
    this.rootSelector = rootSelector;
    this.valueSelector = valueSelector;
    this.validate = validate;
    this.postProcess = postProcess;
  }

  public build(): EpFunc<string> {
    return async ctx => {
      const root = await this.rootSelector(ctx);
      const value = await this.valueSelector(root, ctx);
      const error = this.validate(value);
      if (error) {
        throw error;
      }
      return this.postProcess(value);
    };
  }

  public static forName(
    valueSelector: (locator: Locator, ctx: MdhTvEpisodeScraperEpisodeContext) => Promise<string>,
    rootSelector = "body"
  ): PageSelectorBuilder {
    const opts: PageSelectorBuilderOptions = {
      valueSelector,
      rootSelector: async ctx => ctx.page.locator(rootSelector),
      validate: value => isBlank(value) ? new Error("Invalid name") : null,
      postProcess: value => value.normalize("NFKC")
        .replaceAll("...", "…")
        .trim()
        .replaceAll(/\s+/gu, " ")
    };
    return new PageSelectorBuilder(opts);
  }

  public static forDescription(
    valueSelector: (locator: Locator, ctx: MdhTvEpisodeScraperEpisodeContext) => Promise<string>,
    rootSelector = "body"
  ): PageSelectorBuilder {
    const opts: PageSelectorBuilderOptions = {
      valueSelector,
      rootSelector: async ctx => ctx.page.locator(rootSelector),
      validate: value => isBlank(value) ? new Error("Invalid description") : null,
      postProcess: value => value
        .normalize("NFKC")
        .replaceAll("...", "…")
        .trim()
        .replace(/^ *(?<val>\S+)/gmu, "$<val>")
        .replace(/(?<val>\S+) *$/gmu, "$<val>")
        .replaceAll(/、\s+/gu, "、")
        .replaceAll(/\n{3,}/gu, "\n\n")
        .replaceAll(/[^\S\r\n]*/ug, "<br/>\n")
        .replaceAll(/[^\S\r\n]*\n/ug, "<br/>\n")
        .replaceAll("</h3><br/>\n", "</h3>\n")
        .replaceAll("</h2><br/>\n", "</h2>\n")
        .replaceAll("</h1><br/>\n", "</h1>\n")
    };
    return new PageSelectorBuilder(opts);
  }
}
