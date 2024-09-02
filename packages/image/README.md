# @joshuaavalon/mdh-scrape-image

## Getting Started

```sh
npm i @joshuaavalon/mdh-scrape-image
```

## Usage

### compressImage

Compress image that is not webp or jpeg to lossless webp.

```ts
import { compressImage } from "@joshuaavalon/mdh-scrape-image";

const compressed = await compressImage(buffer);
```

### fetchImage

Fetch image by url via browser or fetch

```ts
import { fetchImage } from "@joshuaavalon/mdh-scrape-image";

const buffer = await fetchImage(ctx, { method: "browser", url });
```

### pageScreenshot

Screenshot and resize a playwright `Page`

```ts
import { fetchImage } from "@joshuaavalon/mdh-scrape-image";

const screenshot = await pageScreenshot(page);
```

### batchFetchImage

```ts
import { batchFetchImage, fetchImage } from "@joshuaavalon/mdh-scrape-image";

const screenshot = await batchFetchImage(page);
```
