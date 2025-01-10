import { logger } from "@/lib/logger";
import elevenlabs from "../init-eleven-labs";
import { ElevenLabsError } from "elevenlabs";

interface AddSharedVoiceParams {
  publicUserId: string;
  voiceId: string;
  newName: string;
}

function extractExistingVoiceId(error: ElevenLabsError): string | null {
  try {
    if (error.message.includes("voice_already_exists")) {
      // Extract the voice ID from the beginning of the error message
      const match = error.message.match(/voice (\w+) already exists/);
      return match ? match[1] : null;
    }
    return null;
  } catch {
    return null;
  }
}

export async function addVoiceToMyVoices({
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
    // Check if it's an ElevenLabsError and the voice already exists
    if (error instanceof ElevenLabsError) {
      const existingVoiceId = extractExistingVoiceId(error);
      if (existingVoiceId) {
        await logger.info(`Voice already exists in collection`, {
          publicUserId,
          originalVoiceId: voiceId,
          existingVoiceId,
          newName,
        });
        return existingVoiceId;
      }
    }

    // Log the error for other cases
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
      const newVoiceId = await addVoiceToMyVoices({
        publicUserId:
          "f87f057c2250691953ac2e6227859706764bd08c88a055a18c74261957885a51",
        voiceId: "tSVwqkJGEKjLklhiN0Nx",
        newName: "Test Voice",
      });
      console.log("Voice ID:", newVoiceId);
    } catch (error) {
      console.error("Error adding shared voice:", error);
    }
  })();
}
