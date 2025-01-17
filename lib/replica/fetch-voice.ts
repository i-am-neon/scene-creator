import { ReplicaVoice } from "@/types/replica-voice";
import { logger } from "../logger";

const REPLICA_API_BASE = "https://api.replicastudios.com/v2";

export async function fetchVoice(id: string): Promise<ReplicaVoice> {
  try {
    const apiKey = process.env.REPLICA_API_KEY;
    if (!apiKey) {
      throw new Error("REPLICA_API_KEY not found in environment variables");
    }

    const response = await fetch(`${REPLICA_API_BASE}/library/voices/${id}`, {
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
        `Failed to fetch voice: ${response.status} ${response.statusText}`
      );
    }

    const voice = await response.json();

    return {
      id: voice.uuid,
      name: voice.name,
      description: voice.description,
      accent: voice.metadata.accent,
      gender: voice.metadata.gender,
      voiceAge: voice.metadata.voiceAge,
      characteristics: voice.characteristics,
      styles: voice.styles.map(
        (style: { uuid: string; name: string; speaker_id: string }) => ({
          id: style.uuid,
          name: style.name,
          speakerId: style.speaker_id,
        })
      ),
      defaultStyle: {
        id: voice.default_style.uuid,
        name: voice.default_style.name,
        speakerId: voice.default_style.speaker_id,
      },
    };
  } catch (error) {
    await logger.error("Failed to fetch Replica voice", {
      voiceId: id,
      error: error instanceof Error ? error.stack : String(error),
    });
    throw error;
  }
}

// Test with Bun
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      // Replace with a valid voice ID for testing
      const testVoiceId = "2bfc6875-308c-4101-bf4d-7c279bc56b75";
      const voice = await fetchVoice(testVoiceId);
      console.log("Fetched voice:", voice);
    } catch (error) {
      console.error("Error:", error);
    }
  })();
}

