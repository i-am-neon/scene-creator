import Replicate from "replicate";
import { logger } from "./logger";

const DEFAULT_MAX_RETRIES = 3;
const BASE_DELAY = 1000;

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface FileOutput {
  blob: () => Promise<Blob>;
  url: () => Promise<URL>;
  toString: () => string;
  readonly locked: boolean;
  cancel: () => Promise<void>;
  getReader: () => ReadableStreamDefaultReader;
  pipeTo: (destination: WritableStream) => Promise<void>;
  pipeThrough: (transform: TransformStream) => ReadableStream;
  tee: () => [ReadableStream, ReadableStream];
  values: () => AsyncIterableIterator<unknown>;
  [Symbol.asyncIterator]: () => AsyncIterator<unknown>;
}

export default async function removeImageBackground({
  imageUrl,
  maxRetries = DEFAULT_MAX_RETRIES,
}: {
  imageUrl: string;
  maxRetries?: number;
}): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const output = (await replicate.run(
        "lucataco/remove-bg:95fcc2a26d3899cd6c2691c900465aaeff466285a65c14638cc5f36f34befaf1",
        { input: { image: imageUrl } }
      )) as FileOutput;

      // Get the URL object and convert it to string
      const urlObj = await output.url();
      const resultUrl = urlObj.href;

      await logger.info("Background removal succeeded", {
        attempt: attempt + 1,
        resultUrl,
      });

      return resultUrl;
    } catch (error) {
      lastError = error as Error;
      const errorDetails = {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
        raw: error,
      };

      if (attempt < maxRetries - 1) {
        const delay = BASE_DELAY * Math.pow(2, attempt);
        await logger.warn("Background removal failed, retrying", {
          attempt: attempt + 1,
          error: errorDetails,
          nextAttemptDelay: delay,
        });
        await sleep(delay);
        continue;
      }

      await logger.error("Background removal failed permanently", {
        error: errorDetails,
        attempts: attempt + 1,
      });
      throw error;
    }
  }

  throw (
    lastError ||
    new Error(`Failed to remove background after ${maxRetries} attempts`)
  );
}

// Test entry point for Bun
if (import.meta.url === `file://${process.argv[1]}`) {
  const outputUrl = await removeImageBackground({
    imageUrl:
      "https://replicate.delivery/pbxt/JWsRA6DxCK24PlMYK5ENFYAFxJGUQTLr0JmLwsLb8uhv1JTU/shoe.jpg",
  });
  console.log("Background removed image URL:", outputUrl);
}

