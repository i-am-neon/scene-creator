import { logger } from "../logger";

const REPLICA_API_BASE = "https://api.replicastudios.com/v2";

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
    await logger.error("Failed to generate text-to-speech", {
      error: error instanceof Error ? error.stack : String(error),
      speakerId: options.speaker_id,
      text: options.text,
    });
    throw error;
  }
}

// Test with Bun
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      const result = await requestTextToSpeech({
        speaker_id: "55cdf980-52c7-4827-8642-6827b54f4447",
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

