import { assert } from "chai";
import { AsyncEventEmitter } from "@joshuaavalon/async-event-emitter";
import { constantPlugin } from "../index.js";

import type { EpisodeScraper, EpisodeScraperContext, EpisodeScraperEventResult, EpisodeScraperEvents } from "@mdhs/core";


describe("Test constantPlugin", async () => {
  it("should episode", async () => {
    const scraper = new AsyncEventEmitter<EpisodeScraperEvents>() as EpisodeScraper;
    await constantPlugin(scraper, { episode: { name: "name" } });
    const value: EpisodeScraperEventResult<string> = {};
    await scraper.emit("scrapeName", { scraper } as EpisodeScraperContext, { metadata: { num: 1, padNum: "01" }, result: {} }, value);
    assert.equal(value.value, "name");
  });

  it("should episodes", async () => {
    const scraper = new AsyncEventEmitter<EpisodeScraperEvents>() as EpisodeScraper;
    await constantPlugin(scraper, { episodes: { 1: { name: "name" } } });
    const value: EpisodeScraperEventResult<string> = {};
    await scraper.emit("scrapeName", { scraper } as EpisodeScraperContext, { metadata: { num: 1, padNum: "01" }, result: {} }, value);
    assert.equal(value.value, "name");
  });

  it("should episode and episodes match", async () => {
    const scraper = new AsyncEventEmitter<EpisodeScraperEvents>() as EpisodeScraper;
    await constantPlugin(scraper, { episode: { name: "name" }, episodes: { 1: { name: "name2" } } });
    const value: EpisodeScraperEventResult<string> = {};
    await scraper.emit("scrapeName", { scraper } as EpisodeScraperContext, { metadata: { num: 1, padNum: "01" }, result: {} }, value);
    assert.equal(value.value, "name2");
  });

  it("should episode and episodes not match", async () => {
    const scraper = new AsyncEventEmitter<EpisodeScraperEvents>() as EpisodeScraper;
    await constantPlugin(scraper, { episode: { name: "name" }, episodes: { 1: { name: "name2" } } });
    const value: EpisodeScraperEventResult<string> = {};
    await scraper.emit("scrapeName", { scraper } as EpisodeScraperContext, { metadata: { num: 2, padNum: "02" }, result: {} }, value);
    assert.equal(value.value, "name");
  });
});
