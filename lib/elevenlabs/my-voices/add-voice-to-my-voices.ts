import { logger } from "@/lib/logger";
import elevenlabs from "../init-eleven-labs";

interface AddSharedVoiceParams {
  publicUserId: string;
  voiceId: string;
  newName: string;
}

export async function addSharedVoice({
  publicUserId,
  voiceId,
  newName,
}: AddSharedVoiceParams): Promise<string> {
  try {
    const result = await elevenlabs.voices.addSharingVoice(
      publicUserId,
      voiceId,
      {
        new_name: newName,
      }
    );

    await logger.info(`Successfully added shared voice`, {
      publicUserId,
      originalVoiceId: voiceId,
      newVoiceId: result.voice_id,
      newName,
    });

    return result.voice_id;
  } catch (error) {
    await logger.error(`Failed to add shared voice`, {
      publicUserId,
      voiceId,
      newName,
      error: error instanceof Error ? error.stack : String(error),
    });
    throw error;
  }
}

// Test with Bun
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      const newVoiceId = await addSharedVoice({
        publicUserId:
          "f87f057c2250691953ac2e6227859706764bd08c88a055a18c74261957885a51",
        voiceId: "tSVwqkJGEKjLklhiN0Nx",
        newName: "Test Voice",
      });
      console.log("Successfully added shared voice. New voice ID:", newVoiceId);
    } catch (error) {
      console.error("Error adding shared voice:", error);
    }
  })();
}

