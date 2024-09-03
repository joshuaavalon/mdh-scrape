import assert from "node:assert/strict";

import type { Builder } from "#type";
import type { MdhTvEpisodeScraper } from "./scraper.js";

export class MdhTvEpisodeScraperBuilder implements Builder< MdhTvEpisodeScraper> {
  private url?: MdhTvEpisodeScraper["scrapeUrl"];
  private name?: MdhTvEpisodeScraper["scrapeName"];
  private sortName?: MdhTvEpisodeScraper["scrapeSortName"];
  private description?: MdhTvEpisodeScraper["scrapeDescription"];
  private airDate?: MdhTvEpisodeScraper["scrapeAirDate"];
  private imageUrls?: MdhTvEpisodeScraper["scrapeImageUrls"];

  public setUrl(url: MdhTvEpisodeScraper["scrapeUrl"]): this {
    assert.ok(typeof url === "function");
    this.url = url;
    return this;
  }

  public setName(name: MdhTvEpisodeScraper["scrapeName"]): this {
    assert.ok(typeof name === "function");
    this.name = name;
    return this;
  }

  public setSortName(sortName: MdhTvEpisodeScraper["scrapeSortName"]): this {
    assert.ok(typeof sortName === "function");
    this.sortName = sortName;
    return this;
  }


  public setDescription(description: MdhTvEpisodeScraper["scrapeDescription"]): this {
    assert.ok(typeof description === "function");
    this.description = description;
    return this;
  }

  public setAirDate(airDate: MdhTvEpisodeScraper["scrapeAirDate"]): this {
    assert.ok(typeof airDate === "function");
    this.airDate = airDate;
    return this;
  }

  public setImageUrls(imageUrls: MdhTvEpisodeScraper["scrapeImageUrls"]): this {
    assert.ok(typeof imageUrls === "function");
    this.imageUrls = imageUrls;
    return this;
  }

  public build(): MdhTvEpisodeScraper {
    const scrapeUrl = this.url;
    const scrapeName = this.name;
    const scrapeSortName = this.sortName;
    const scrapeDescription = this.description;
    const scrapeAirDate = this.airDate;
    const scrapeImageUrls = this.imageUrls;
    assert.ok(typeof scrapeUrl === "function");
    assert.ok(typeof scrapeName === "function");
    assert.ok(typeof scrapeSortName === "function");
    assert.ok(typeof scrapeDescription === "function");
    assert.ok(typeof scrapeAirDate === "function");
    assert.ok(typeof scrapeImageUrls === "function");
    return { scrapeUrl, scrapeName, scrapeSortName, scrapeDescription, scrapeAirDate, scrapeImageUrls };
  }
}
