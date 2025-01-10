import Replicate from "replicate";
import { logger } from "./logger";
import { refinePrompt } from "./refine-prompt";

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
const NSFW_ERROR_PATTERN = /NSFW content detected/i;

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
  let currentPrompt = prompt
    .replace(/[\n\r]/g, " ")
    .replace(/['"{}]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  let lastError: Error | null = null;
  let needsRefinement = false;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (needsRefinement) {
        currentPrompt = await refinePrompt(currentPrompt);
        needsRefinement = false;
      }

      const prediction = await replicate.predictions.create({
        model: "black-forest-labs/flux-1.1-pro-ultra",
        input: {
          prompt: currentPrompt,
          aspect_ratio: aspectRatio,
          output_format: "jpg",
          safety_tolerance: 6,
        },
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

      await logger.info("Image generation succeeded", {
        attempt: attempt + 1,
        result,
        prompt: currentPrompt,
        wasRefined: currentPrompt !== prompt,
      });

      return result;
    } catch (error) {
      lastError = error as Error;
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const isNSFWError = NSFW_ERROR_PATTERN.test(errorMessage);

      if (isNSFWError && !needsRefinement) {
        needsRefinement = true;
        continue;
      }

      const errorDetails = {
        message: errorMessage,
        prompt: currentPrompt,
        name: error instanceof Error ? error.name : undefined,
        raw: error,
        isNSFWError,
      };

      if (attempt < maxRetries - 1) {
        const delay = BASE_DELAY * Math.pow(2, attempt);
        await logger.warn("Image generation failed, retrying", {
          attempt: attempt + 1,
          error: errorDetails,
          nextAttemptDelay: delay,
        });
        await sleep(delay);
        continue;
      }

      await logger.error("Image generation failed permanently", {
        attempts: attempt + 1,
        error: errorDetails,
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
  (async () => {
    const image = await generateImage({
      prompt:
        "A vast, oceanic world teeming with diverse islands, mythical creatures, powerful adventurers, and ancient mysteries, where freedom and ambition drive endless journeys and epic battles.",
      aspectRatio: "1:1",
    });
    console.log("image", image);
  })();
}
