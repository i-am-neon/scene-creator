import { ReplicaVoice } from "@/types/replica-voice";
import { logger } from "../logger";

const REPLICA_API_BASE = "https://api.replicastudios.com/v2";

// List of banned voice IDs
const BANNED_VOICE_IDS = ["5f176823-8239-42aa-9326-ca5a82f7e4ad"] as const;

export async function fetchVoices(): Promise<ReplicaVoice[]> {
  try {
    const apiKey = process.env.REPLICA_API_KEY;
    if (!apiKey) {
      throw new Error("REPLICA_API_KEY not found in environment variables");
    }

    const response = await fetch(`${REPLICA_API_BASE}/library/voices`, {
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": "application/json",
      },
      next: {
        revalidate: 3600, // Cache for 1 hour
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch voices: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    const voices: ReplicaVoice[] = data.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((voice: any) => !BANNED_VOICE_IDS.includes(voice.uuid))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((voice: any) => ({
        id: voice.uuid,
        name: voice.name,
        description: voice.description,
        accent: voice.metadata.accent,
        gender: voice.metadata.gender,
        voiceAge: voice.metadata.voiceAge,
        characteristics: voice.characteristics,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        styles: voice.styles.map((style: any) => ({
          id: style.uuid,
          name: style.name,
        })),
      }));

    return voices;
  } catch (error) {
    await logger.error("Failed to fetch Replica voices", {
      error: error instanceof Error ? error.stack : String(error),
    });
    throw error;
  }
}

// Test with Bun
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      const voices = await fetchVoices();
      console.log("Fetched voices:", voices);
    } catch (error) {
      console.error("Error:", error);
    }
  })();
}
