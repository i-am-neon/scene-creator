import { Script } from "@/types/scene";
import { readCharacter } from "@/db/character/read-character";
import { logger } from "@/lib/logger";
import { fetchVoice } from "./fetch-voice";
import chooseVoiceStyle from "./choose-voice-style";
import { requestPromptTextToSpeech } from "./request-prompt-text-to-speech";
import { v4 as uuidv4 } from "uuid";
import generateSpeechPrompt from "./gen-speech-prompt";
import { CharacterPreSave } from "@/types/character";

interface ConversationEntry {
  source: string;
  text: string;
  additional_context: string | null;
  target: string;
}

export default async function genScriptAudio({
  script,
  characterIds,
  narratorVoiceId,
}: {
  script: Script;
  characterIds: Record<string, number>;
  narratorVoiceId: string;
}): Promise<string[]> {
  const conversationHistory: ConversationEntry[] = [];
  const audioUrls: string[] = [];

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

      // Get character details if not narrator
      const character = !isNarrator
        ? await readCharacter(characterIds[line.characterName])
        : undefined;

      // Choose voice style based on line content
      const styleId = await chooseVoiceStyle({
        text: line.text,
        voice,
        context:
          conversationHistory.length > 0
            ? conversationHistory[conversationHistory.length - 1].text
            : undefined,
      });

      // Generate prompts for PTTS
      const prompts = await generateSpeechPrompt({
        text: line.text,
        character: character as CharacterPreSave,
        isNarrator,
      });

      // Generate audio
      const result = await requestPromptTextToSpeech({
        user_prompt: prompts.userPrompt,
        system_prompt: prompts.systemPrompt,
        conversation_history: conversationHistory,
        speech: {
          speaker_id: voiceId,
          text: line.text,
          voice_preset_id: styleId,
          user_metadata: {
            session_id: uuidv4(),
          },
          user_tags: [line.characterName],
        },
      });

      // Update conversation history
      conversationHistory.push({
        source: "assistant",
        text: line.text,
        additional_context: JSON.stringify({
          character: line.characterName,
          emotion: voice.styles.find((s) => s.id === styleId)?.name,
        }),
        target: "user",
      });

      audioUrls.push(result.url);

      await logger.info("Generated audio for line", {
        character: line.characterName,
        textLength: line.text.length,
        styleUsed: voice.styles.find((s) => s.id === styleId)?.name,
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

