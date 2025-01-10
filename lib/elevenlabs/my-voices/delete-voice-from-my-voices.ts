import { logger } from "../../logger";
import elevenlabs from "../init-eleven-labs";

export async function deleteVoiceFromMyVoices(
  voiceId: string
): Promise<boolean> {
  try {
    // Delete the voice
    await elevenlabs.voices.delete(voiceId);
    await logger.info(`Successfully deleted voice`, {
      voiceId,
    });
    return true;
  } catch (error) {
    return false;
  }
}

// Test with Bun
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      // Replace with an actual voice ID for testing
      const testVoiceId = "tSVwqkJGEKjLklhiN0Nx";
      const success = await deleteVoiceFromMyVoices(testVoiceId);
      console.log("Voice deletion result:", success ? "Success" : "Failed");
    } catch (error) {
      console.error("Error deleting voice:", error);
    }
  })();
}

