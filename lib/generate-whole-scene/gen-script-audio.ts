import { Script } from "@/types/scene";
import genVoice from "../gen-voice";
import { readCharacter } from "@/db/character/read-character";
import { logger } from "../logger";

export default async function genScriptAudio({
  script,
  characterIds,
  narratorVoiceId,
}: {
  script: Script;
  characterIds: Record<string, number>;
  narratorVoiceId: string;
}): Promise<string[]> {
  const promises = script.map(async (line) => {
    if (line.characterName === "Narrator") {
      return genVoice({ voiceId: narratorVoiceId, text: line.text });
    } else {
      const thisCharacterId = characterIds[line.characterName];
      if (!thisCharacterId) {
        throw new Error(
          `Character ID not found for ${
            line.characterName
          }. All CharacterIds: ${JSON.stringify(characterIds)}`
        );
      }
      const thisCharacter = await readCharacter(thisCharacterId);
      if (!thisCharacter) {
        throw new Error(`Character not found for ID ${thisCharacterId}`);
      }
      return genVoice({ voiceId: thisCharacter.voiceId, text: line.text });
    }
  });

  try {
    const voiceIds = await Promise.all(promises);

    return voiceIds as string[];
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

