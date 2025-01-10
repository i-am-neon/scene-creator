import saveElevenLabsAudio from "@/db/save-elevenlabs-audio";
import elevenlabs from "./init-eleven-labs";
import { getVoiceRateLimiter } from "./rate-limiter";
import { ElevenLabsError, formatElevenLabsError } from "./elevenlabs-error";
import { logger } from "../logger";
import { voiceOptions } from "./voice-options/voice-options";
import { addVoiceToMyVoices } from "./my-voices/add-voice-to-my-voices";
import { deleteVoiceFromMyVoices } from "./my-voices/delete-voice-from-my-voices";

export default async function genVoice({
  voiceId,
  text,
}: {
  voiceId: string;
  text: string;
}) {
  const rateLimiter = getVoiceRateLimiter();

  try {
    // First add the voice to My Voices
    const voice = voiceOptions.find((v) => v.voice_id === voiceId);
    if (!voice) {
      throw new Error(`Voice not found for ID ${voiceId}`);
    }
    await addVoiceToMyVoices({
      publicUserId: voice.public_owner_id,
      voiceId,
      newName: voice.name,
    });

    await logger.info("Waiting for rate limiter slot", { voiceId, text });
    await rateLimiter.acquire();

    await logger.info("Generating voice", { voiceId, text });
    const audio = await elevenlabs.generate({
      voice: voiceId,
      text,
      model_id: "eleven_multilingual_v2",
    });
    await logger.info("Generated voice", { voiceId, text });

    return await saveElevenLabsAudio({
      stream: audio,
    });
  } catch (error) {
    const elevenlabsError = new ElevenLabsError(error);
    const formattedError = formatElevenLabsError(elevenlabsError);

    await logger.error("Error generating voice: " + formattedError, {
      voiceId,
      text,
      errorDetails: elevenlabsError.toJSON(),
    });

    throw elevenlabsError;
  } finally {
    rateLimiter.release();
    // Remove the voice from My Voices
    await deleteVoiceFromMyVoices(voiceId);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  genVoice({
    voiceId: "lqydY2xVUkg9cEIFmFMU",
    text: "Hello, world! I am a goddamn minitaur!",
  }).then(console.log);
}

