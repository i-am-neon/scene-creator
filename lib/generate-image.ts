import Replicate from "replicate";
import { logger } from "./logger";

type AspectRatio =
  | "1:1"
  | "16:9"
  | "21:9"
  | "3:2"
  | "2:3"
  | "4:5"
  | "5:4"
  | "3:4"
  | "4:3"
  | "9:16"
  | "9:21";

const DEFAULT_MAX_RETRIES = 3;
const BASE_DELAY = 1000;

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default async function generateImage({
  prompt,
  aspectRatio,
  maxRetries = DEFAULT_MAX_RETRIES,
}: {
  prompt: string;
  aspectRatio: AspectRatio;
  maxRetries?: number;
}): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await logger.info("Attempting image generation", {
        attempt: attempt + 1,
        maxRetries,
        prompt,
      });

      const prediction = await replicate.predictions.create({
        model: "black-forest-labs/flux-1.1-pro-ultra",
        input: { prompt, aspect_ratio: aspectRatio, output_format: "jpg" },
      });

      let result = "";
      while (result === "") {
        const check = await replicate.predictions.get(prediction.id);
        if (check.status === "failed") {
          throw new Error(JSON.stringify(check.error));
        } else if (check.status === "succeeded") {
          result = check.output;
        } else {
          await sleep(250);
        }
      }

      await logger.info("Image generation succeeded", { attempt: attempt + 1 });
      return result;
    } catch (error) {
      lastError = error as Error;
      const errorDetails = {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
        raw: error, // Include raw error for additional context
      };

      if (attempt < maxRetries - 1) {
        const delay = BASE_DELAY * Math.pow(2, attempt);
        await logger.warn("Image generation failed, retrying", {
          error: errorDetails,
          attempt: attempt + 1,
          nextAttemptDelay: delay,
        });
        await sleep(delay);
        continue;
      }

      await logger.error("Image generation failed permanently", {
        error: errorDetails,
        attempts: attempt + 1,
      });
      throw error;
    }
  }

  throw (
    lastError ||
    new Error(`Failed to generate image after ${maxRetries} attempts`)
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const image = await generateImage({
    prompt:
      "A vast, oceanic world teeming with diverse islands, mythical creatures, powerful adventurers, and ancient mysteries, where freedom and ambition drive endless journeys and epic battles.",
    aspectRatio: "1:1",
  });
  console.log("image", image);
}
