import { assert } from "chai";
import { DateTime } from "luxon";
import { AsyncEventEmitter } from "@joshuaavalon/async-event-emitter";

import { dateTimePlugin } from "../index.js";

import type { EpisodeScraper, EpisodeScraperContext, EpisodeScraperEventResult, EpisodeScraperEvents } from "#episode";


describe("Test dateTimePlugin", async () => {
  it("should equal", async () => {
    const scraper = new AsyncEventEmitter<EpisodeScraperEvents>() as EpisodeScraper;
    await dateTimePlugin(scraper, { mapping: { 1: DateTime.fromISO("2024-01-01T00:00:00.00Z"), 3: DateTime.fromISO("2024-01-01T00:00:00.00Z") } });
    const value: EpisodeScraperEventResult<DateTime> = {};
    await scraper.emit("scrapeAirDate", { scraper } as EpisodeScraperContext, { metadata: { num: 1, padNum: "01" }, result: {} }, value);
    assert.isTrue(value.value?.equals(DateTime.fromISO("2024-01-01T00:00:00.00Z")));
  });

  it("should span", async () => {
    const scraper = new AsyncEventEmitter<EpisodeScraperEvents>() as EpisodeScraper;
    await dateTimePlugin(scraper, { mapping: { 1: DateTime.fromISO("2024-01-01T00:00:00.00Z"), 3: DateTime.fromISO("2024-01-01T00:00:00.00Z") } });
    const value: EpisodeScraperEventResult<DateTime> = {};
    await scraper.emit("scrapeAirDate", { scraper } as EpisodeScraperContext, { metadata: { num: 2, padNum: "02" }, result: {} }, value);
    assert.isTrue(value.value?.equals(DateTime.fromISO("2024-01-08T00:00:00.00Z")));
  });

  it("should map", async () => {
    const scraper = new AsyncEventEmitter<EpisodeScraperEvents>() as EpisodeScraper;
    await dateTimePlugin(scraper, { mapping: { 1: DateTime.fromISO("2024-01-01T00:00:00.00Z"), 3: DateTime.fromISO("2024-01-01T00:00:00.00Z") } });
    const value: EpisodeScraperEventResult<DateTime> = {};
    await scraper.emit("scrapeAirDate", { scraper } as EpisodeScraperContext, { metadata: { num: 3, padNum: "03" }, result: {} }, value);
    assert.isTrue(value.value?.equals(DateTime.fromISO("2024-01-01T00:00:00.00Z")));
  });

  it("should use nearest", async () => {
    const scraper = new AsyncEventEmitter<EpisodeScraperEvents>() as EpisodeScraper;
    await dateTimePlugin(scraper, { mapping: { 1: DateTime.fromISO("2024-01-08T00:00:00.00Z"), 3: DateTime.fromISO("2024-01-01T00:00:00.00Z") } });
    const value: EpisodeScraperEventResult<DateTime> = {};
    await scraper.emit("scrapeAirDate", { scraper } as EpisodeScraperContext, { metadata: { num: 4, padNum: "04" }, result: {} }, value);
    assert.isTrue(value.value?.equals(DateTime.fromISO("2024-01-08T00:00:00.00Z")));
  });
});
