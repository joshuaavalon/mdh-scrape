import { fastify } from "fastify";
import plugin from "../index.js";

describe("Test @joshuaavalon/fastify-plugin-storage", async () => {
  it("should register", async () => {
    const app = fastify();
    await app.register(plugin, { type: "local", baseDir: "" });
  });
});
