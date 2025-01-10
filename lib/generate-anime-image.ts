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

interface FileOutput {
  url(): { href: string };
  blob(): Promise<Blob>;
}

const DEFAULT_MAX_RETRIES = 3;
const BASE_DELAY = 1000;
const NSFW_ERROR_PATTERN = /NSFW content detected/i;

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const loraToken = "TOK";

export default async function generateAnimeImage({
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
      currentPrompt = `${loraToken} ${currentPrompt}`;

      const output = (await replicate.run(
        "makinsongary698/jh:4423082b68f497cf91a93031872cb5c3f7d5f8a9de8fa32d4db94e17094049b9",
        {
          input: {
            prompt: currentPrompt,
            aspect_ratio: aspectRatio,
            output_quality: 100,
            disable_safety_checker: true,
          },
        }
      )) as FileOutput[];

      const result = output[0].url().href;

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
    const image = await generateAnimeImage({
      prompt:
        "Portrait composition from hip level to head, hips/belt at bottom frame edge. Character faces 30 degrees left, standing formally. Pure white background. Right-side studio lighting. Realistic anime rendering. Style is Fire Emblem Path of Radiance character portrait. Sharp details, professional shading. Character fills full vertical frame. No cropping above hips. Gender: male Age: 60 hairStyle: Wispy, translucent strands that drift like sea mist, hairColor: Silvery-white with ethereal luminescence, eyeColor: Deep ocean blue with swirling spectral patterns, skinTone: Translucent, with a pale bluish-gray ethereal glow, build: Tall and lean, with a ghostly silhouette that seems to fade at the edges, facialFeatures: Sharp, angular features with a timeless quality, high cheekbones and a penetrating gaze, clothing: Tattered maritime captains attire from a bygone era - a spectral naval coat in faded navy blue and silver, with ghostly epaulettes and phantom buttons, accessories: An ancient maritime compass that floats beside him, perpetually pointing to unknown destinations, distinctiveFeatures: Partial transparency that reveals glimpses of the spectral realm behind him, expression: Intense and contemplative, with a mixture of sorrow and determination",
      aspectRatio: "2:3",
    });
    console.log("image", image);
  })();
}

