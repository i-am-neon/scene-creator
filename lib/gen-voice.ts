import saveAudio from "@/db/save-audio";
import elevenlabs from "./init-eleven-labs";
import { logger } from "./logger";

export default async function genVoice({
  voiceId,
  text,
}: {
  voiceId: string;
  text: string;
}) {
  try {
    await logger.info("Generating voice", { voiceId, text });

    const audio = await elevenlabs.generate({
      voice: voiceId,
      text,
      model_id: "eleven_multilingual_v2",
    });

    await logger.info("Generated voice", { voiceId, text });

    return await saveAudio({
      stream: audio,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown error occurred while generating voice";

    await logger.error(errorMessage, {
      voiceId,
      text,
      error: error instanceof Error ? error.stack : String(error),
      isElevenLabsError: error instanceof Error && "status" in error,
      statusCode:
        error instanceof Error && "status" in error
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (error as any).status
          : undefined,
    });

    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  genVoice({
    voiceId: "rm6bQBXZFIjAZKKIhbhm",
    text: "Hello, world! I am a goddamn minitaur!",
  }).then(console.log);
}
