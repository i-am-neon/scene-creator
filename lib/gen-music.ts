import Replicate from "replicate";
import { logger } from "@/lib/logger";
import saveAudioUrl from "@/db/save-audio-url";

interface FileOutput {
  url(): string;
  blob(): Promise<Blob>;
}

const DEFAULT_MAX_RETRIES = 3;
const BASE_DELAY = 1000;

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default async function generateMusic({
  prompt,
  duration,
  maxRetries = DEFAULT_MAX_RETRIES,
}: {
  prompt: string;
  duration: number;
  maxRetries?: number;
}): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const output = (await replicate.run(
        "meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb",
        {
          input: {
            prompt,
            duration,
            temperature: 1,
            model_version: "stereo-large",
          },
        }
      )) as FileOutput;

      const url = await saveAudioUrl({ url: output.url() });

      await logger.info("Music generation succeeded", {
        attempt: attempt + 1,
        url,
        prompt,
      });

      return url;
    } catch (error) {
      lastError = error as Error;
      const errorDetails = {
        message: error instanceof Error ? error.message : String(error),
        prompt,
        name: error instanceof Error ? error.name : undefined,
        raw: error,
      };

      if (attempt < maxRetries - 1) {
        const delay = BASE_DELAY * Math.pow(2, attempt);
        await logger.warn("Music generation failed, retrying", {
          attempt: attempt + 1,
          error: errorDetails,
          nextAttemptDelay: delay,
        });
        await sleep(delay);
        continue;
      }

      await logger.error("Music generation failed permanently", {
        attempts: attempt + 1,
        error: errorDetails,
      });
      throw error;
    }
  }

  throw (
    lastError ||
    new Error(`Failed to generate music after ${maxRetries} attempts`)
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      const url = await generateMusic({
        prompt:
          "Edo25 major g melodies that sound triumphant and cinematic. Leading up to a crescendo that resolves in a 9th harmonic",
        duration: 2,
      });
      console.log("Generated music URL:", url);
    } catch (error) {
      console.error("Error:", error);
    }
  })();
}

