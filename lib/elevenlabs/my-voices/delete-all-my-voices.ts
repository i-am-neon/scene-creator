// "My Voices" is the pool of voices Elevenlabs allows you to use. You can delete all of them with this script.

import { logger } from "../../logger";
import elevenlabs from "../init-eleven-labs";

export async function deleteAllMyVoices(): Promise<void> {
  try {
    // Get all voices
    const { voices } = await elevenlabs.voices.getShared();

    // Delete each voice
    const deletionPromises = voices.map(async (voice) => {
      try {
        await elevenlabs.voices.delete(voice.voice_id);
        await logger.info(`Successfully deleted voice`, {
          voiceId: voice.voice_id,
          voiceName: voice.name,
        });
      } catch (error) {
        await logger.error(`Failed to delete voice`, {
          voiceId: voice.voice_id,
          voiceName: voice.name,
          error: error instanceof Error ? error.stack : String(error),
        });
      }
    });

    // Wait for all deletions to complete
    await Promise.all(deletionPromises);
    await logger.info(`Completed voice deletion process`, {
      totalVoices: voices.length,
    });
  } catch (error) {
    await logger.error(`Failed to fetch or delete voices`, {
      error: error instanceof Error ? error.stack : String(error),
    });
    throw error;
  }
}

// Test with Bun
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      await deleteAllMyVoices();
      console.log("Successfully deleted all voices");
    } catch (error) {
      console.error("Error deleting voices:", error);
    }
  })();
}

