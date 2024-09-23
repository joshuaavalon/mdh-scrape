import { assert } from "chai";
import imageType from "image-type";
import { compressImage } from "../compress-image.js";
import { fetchImage } from "../fetch-image.js";


describe("Test compressImage", async () => {
  it("should compress", async () => {
    const result = await fetchImage("https://upload.wikimedia.org/wikipedia/commons/7/70/Example.png");
    const buffer = await compressImage(result.data);
    const type = await imageType(buffer);
    assert.equal(type?.mime, "image/webp");
  });
});
