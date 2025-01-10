import saveElevenLabsAudio from "@/db/save-elevenlabs-audio";
import { logger } from "../logger";
import { ElevenLabsError, formatElevenLabsError } from "./elevenlabs-error";
import elevenlabs from "./init-eleven-labs";
import { getVoiceRateLimiter } from "./rate-limiter";

export default async function genVoice({
  voiceId,
  text,
}: {
  voiceId: string;
  text: string;
}) {
  const rateLimiter = getVoiceRateLimiter();

  try {
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
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  genVoice({
    voiceId: "lqydY2xVUkg9cEIFmFMU",
    text: "Hello, world! I am a goddamn minitaur!",
  }).then(console.log);
}

