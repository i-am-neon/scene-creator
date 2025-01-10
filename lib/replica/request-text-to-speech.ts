import { logger } from "../logger";

const REPLICA_API_BASE = "https://api.replicastudios.com/v2";
const DEFAULT_MAX_RETRIES = 3;
const BASE_DELAY = 1000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface TTSRequestMetadata {
  session_id: string;
}

interface TTSRequestOptions {
  speaker_id: string;
  text: string;
  extensions?: string[];
  sample_rate?: number;
  bit_rate?: number;
  global_pace?: number;
  model_chain?: string;
  language_code?: string;
  global_pitch?: number;
  auto_pitch?: boolean;
  global_volume?: number;
  voice_preset_id?: string;
  effects_preset_id?: string;
  user_metadata?: TTSRequestMetadata;
  user_tags?: string[];
  maxRetries?: number;
}

interface VoiceStyle {
  id: string;
  name: string;
}

interface Voice {
  id: string;
  name: string;
  style: VoiceStyle[];
}

interface TTSResponse {
  uuid: string;
  state: string;
  generation_type: string;
  model_chain: string;
  language_code: string;
  text: string;
  voice_blend: string | null;
  voice: Voice[];
  duration: number;
  user_tags: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user_metadata: Record<string, any>;
  created: string; // ISO date-time string
  url: string;
  available_formats: string[];
  additional_fields: {
    warning?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
}

const DEFAULT_OPTIONS: Partial<TTSRequestOptions> = {
  extensions: ["wav"],
  sample_rate: 44100,
  bit_rate: 128,
  global_pace: 1,
  model_chain: "vox_1_0",
  language_code: "en",
  global_pitch: 0,
  auto_pitch: true,
  global_volume: 0,
};

export async function requestTextToSpeech(
  options: TTSRequestOptions
): Promise<TTSResponse> {
  let lastError: Error | null = null;
  const maxRetries = options.maxRetries || DEFAULT_MAX_RETRIES;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const apiKey = process.env.REPLICA_API_KEY;
      if (!apiKey) {
        throw new Error("REPLICA_API_KEY not found in environment variables");
      }

      const requestOptions = {
        ...DEFAULT_OPTIONS,
        ...options,
      };

      const response = await fetch(`${REPLICA_API_BASE}/speech/tts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": apiKey,
        },
        body: JSON.stringify(requestOptions),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to generate speech: ${response.status} ${response.statusText}`
        );
      }

      const data: TTSResponse = await response.json();
      return data;
    } catch (error) {
      lastError = error as Error;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (attempt < maxRetries - 1) {
        const delay = BASE_DELAY * Math.pow(2, attempt);
        await logger.warn("Text-to-speech generation failed, retrying", {
          error: errorMessage,
          attempt: attempt + 1,
          nextAttemptDelay: delay,
          speakerId: options.speaker_id,
          text: options.text,
          stack: error instanceof Error ? error.stack : undefined,
        });
        await sleep(delay);
        continue;
      }

      await logger.error("Text-to-speech generation failed permanently", {
        attempts: attempt + 1,
        speakerId: options.speaker_id,
        error: error instanceof Error ? error.stack : String(error),
        text: options.text,
      });
      throw error;
    }
  }

  throw (
    lastError ||
    new Error(`Failed to generate speech after ${maxRetries} attempts`)
  );
}

// Test with Bun
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      const result = await requestTextToSpeech({
        speaker_id: "e27a4298-3cb2-4390-b105-c9f1985d092c",
        text: "Hello world!",
        user_metadata: {
          session_id: "test-session",
        },
        user_tags: ["test"],
      });
      console.log("TTS Response:", JSON.stringify(result, null, 2));
    } catch (error) {
      console.error("Error:", error);
    }
  })();
}

