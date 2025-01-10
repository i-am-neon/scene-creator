import { Script } from "@/types/scene";
import { readCharacter } from "@/db/character/read-character";
import { logger } from "@/lib/logger";
import { fetchVoice } from "./fetch-voice";
import chooseVoiceStyle from "./choose-voice-style";
import { requestTextToSpeech } from "./request-text-to-speech";
import { v4 as uuidv4 } from "uuid";

export default async function genScriptAudio({
  script,
  characterIds,
  narratorVoiceId,
}: {
  script: Script;
  characterIds: Record<string, number>;
  narratorVoiceId: string;
}): Promise<string[]> {
  const audioUrls: string[] = [];
  let previousText: string | undefined;

  try {
    for (const line of script) {
      const isNarrator = line.characterName === "Narrator";
      const voiceId = isNarrator
        ? narratorVoiceId
        : (await readCharacter(characterIds[line.characterName]))?.voiceId;

      if (!voiceId) {
        throw new Error(`Voice ID not found for ${line.characterName}`);
      }

      // Get voice details
      const voice = await fetchVoice(voiceId);

      // Choose voice style based on line content
      const styleId = await chooseVoiceStyle({
        text: line.text,
        voice,
        context: previousText,
      });

      // Find the selected style
      const selectedStyle = voice.styles.find((s) => s.id === styleId);
      if (!selectedStyle?.speakerId) {
        throw new Error(
          `Could not find speakerId for style ${styleId} in voice ${voiceId}`
        );
      }

      // Generate audio using text-to-speech with the style's speakerId
      const result = await requestTextToSpeech({
        speaker_id: selectedStyle.speakerId, // Use the style's speakerId instead of the voice ID
        text: line.text,
        user_metadata: {
          session_id: uuidv4(),
        },
        user_tags: [line.characterName],
      });

      audioUrls.push(result.url);
      previousText = line.text;

      await logger.info("Generated audio for line", {
        character: line.characterName,
        textLength: line.text.length,
        styleUsed: selectedStyle.name,
        speakerIdUsed: selectedStyle.speakerId,
      });
    }

    return audioUrls;
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown error occurred while generating audio";

    await logger.error(errorMessage, {
      scriptLength: script.length,
      characterIds,
      narratorVoiceId,
      error: error instanceof Error ? error.stack : String(error),
      failedScript: script,
    });

    throw error;
  }
}

// Test
if (import.meta.url === `file://${process.argv[1]}`) {
  const testScript: Script = [
    {
      characterName: "Narrator",
      text: "The storm raged outside as Captain Marcus addressed his crew.",
    },
    {
      characterName: "Captain Marcus",
      text: "We've faced worse than this, crew. Stay at your stations!",
    },
  ];

  const characterIds = {
    "Captain Marcus": 1,
  };

  genScriptAudio({
    script: testScript,
    characterIds,
    narratorVoiceId: "39a22b49-4d11-453c-8777-f529415b4a07", // Example voice ID
  })
    .then(console.log)
    .catch(console.error);
}
