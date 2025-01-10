import saveAudioStream from "@/db/save-audio-stream";
import { logger } from "../logger";
import { ElevenLabsError, formatElevenLabsError } from "./elevenlabs-error";
import elevenlabs from "./init-eleven-labs";
import { getVoiceRateLimiter } from "./rate-limiter";

export default async function genVoice({
  voiceId,
  text,
  emotion,
}: {
  voiceId: string;
  text: string;
  emotion: string;
}) {
  const rateLimiter = getVoiceRateLimiter();

  try {
    await rateLimiter.acquire();

    const audio = await elevenlabs.generate({
      voice: voiceId,
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.3,
        similarity_boost: 0.75,
        use_speaker_boost: true,
      },
      next_text: emotion,
    });
    await logger.info("Generated voice", { voiceId, text });

    return await saveAudioStream({
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
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  genVoice({
    voiceId: "lUCNYQh2kqW2wiie85Qk",
    text: "Hello, world! I am a goddamn minitaur!",
    emotion: "they said with excitement.",
  }).then(console.log);
}

