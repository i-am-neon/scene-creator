"use server";
import { insertCharacter } from "@/db/character/insert-character";
import updateStory from "@/db/story/update-story";
import { generateCharacter } from "@/lib/generate-character";
import generateCharacterPortraitUrl from "@/lib/generate-character-portrait-url/generate-character-portrait-url";
import { Character } from "@/types/character";
import { CharacterIdea } from "@/types/character-idea";
import { Story } from "@/types/story";
import { chooseVoice } from "./elevenlabs/choose-voice";
import { generateVoiceSampleUrl } from "./elevenlabs/gen-voice-sample-url";
import { getVoicesByGender } from "./elevenlabs/voice-options/voice-options";
import { TEST_STORY } from "./generate-whole-scene/test-data";
import { logger } from "./logger";

async function generateSingleCharacter(
  characterIdea: CharacterIdea,
  story: Story
): Promise<Character> {
  const character = await generateCharacter({ characterIdea, story });
  await logger.info("Generated character", { character });

  const portraitUrl = await generateCharacterPortraitUrl(character);
  await logger.info(`Generated portrait for "${character.displayName}"`, {
    portraitUrl,
  });

  const unusedVoices = Object.values(
    getVoicesByGender(character.gender)
  ).filter((voice) => !new Set(story.usedVoiceIds ?? []).has(voice.voice_id));
  const voiceId = await chooseVoice({
    character,
    voiceOptions: unusedVoices,
  });
  await updateStory(story.id, {
    usedVoiceIds: [...(story.usedVoiceIds ?? []), voiceId],
  });
  await logger.info(`Chose voice for "${character.displayName}"`, { voiceId });

  const voiceSampleUrl = await generateVoiceSampleUrl({ character, voiceId });
  await logger.info(`Generated voice sample for "${character.displayName}"`, {
    voiceSampleUrl,
  });

  return insertCharacter({
    ...character,
    portraitUrl,
    storyId: story.id,
    voiceId,
    voiceSampleUrl,
  });
}

export default async function generateBulkCharactersAndPortraits({
  characterIdeas,
  story,
}: {
  characterIdeas: CharacterIdea[];
  story: Story;
}): Promise<Character[]> {
  await logger.info("Generating characters and portraits");

  const characters: Character[] = [];
  for (const characterIdea of characterIdeas) {
    const character = await generateSingleCharacter(characterIdea, story);
    characters.push(character);
  }
  return characters;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateBulkCharactersAndPortraits({
    story: TEST_STORY,
    characterIdeas: [
      {
        name: "Elena",
        description:
          "Elena Ravencroft, a 24-year-old cautious yet curious researcher with concealed magical abilities, navigates the oppressive anti-magic regime of the Council while secretly uncovering forbidden knowledge and seeking to unlock the ancient powers tied to her mysterious past.",
      },
    ],
  });
}

