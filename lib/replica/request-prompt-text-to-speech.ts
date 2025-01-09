import { logger } from "../logger";

const REPLICA_API_BASE = "https://api.replicastudios.com/v2";

interface ConversationEntry {
  source: string;
  text: string;
  additional_context: string | null;
  target: string;
}

interface PTTSRequestMetadata {
  session_id: string;
}

interface SpeechOptions {
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
  user_metadata?: PTTSRequestMetadata;
  user_tags?: string[];
}

interface PTTSRequestOptions {
  user_prompt: string;
  system_prompt?: string;
  conversation_history?: ConversationEntry[];
  speech: SpeechOptions;
}

interface PTTSResponse {
  uuid: string;
  text: string;
  url: string;
  conversation_history: ConversationEntry[];
}

const DEFAULT_SPEECH_OPTIONS: Partial<SpeechOptions> = {
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

export async function requestPromptTextToSpeech(
  options: PTTSRequestOptions
): Promise<PTTSResponse> {
  try {
    const apiKey = process.env.REPLICA_API_KEY;
    if (!apiKey) {
      throw new Error("REPLICA_API_KEY not found in environment variables");
    }

    const requestOptions = {
      ...options,
      speech: {
        ...DEFAULT_SPEECH_OPTIONS,
        ...options.speech,
      },
    };

    const response = await fetch(`${REPLICA_API_BASE}/speech/ptts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify(requestOptions),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to generate prompt speech: ${response.status} ${response.statusText}`
      );
    }

    const data: PTTSResponse = await response.json();
    return data;
  } catch (error) {
    await logger.error("Failed to generate prompt text-to-speech", {
      error: error instanceof Error ? error.stack : String(error),
      userPrompt: options.user_prompt,
      speakerId: options.speech.speaker_id,
    });
    throw error;
  }
}

// Test with Bun
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      const result = await requestPromptTextToSpeech({
        user_prompt: "When shall we approach the Rubicon?",
        system_prompt:
          "You are Julius Caesar and know his history - as it is now yours.",
        conversation_history: [
          {
            source: "user",
            text: "When shall we approach the Rubicon?",
            additional_context: null,
            target: "assistant",
          },
        ],
        speech: {
          speaker_id: "55a0aad5-a739-402f-9cec-36b01ff81a41",
          text: "Hello V 2",
          user_metadata: {
            session_id: "test-session",
          },
          user_tags: ["test"],
        },
      });
      console.log("PTTS Response:", JSON.stringify(result, null, 2));
    } catch (error) {
      console.error("Error:", error);
    }
  })();
}
