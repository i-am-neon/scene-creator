"use server";

import { insertCharacter } from "@/db/character/insert-character";
import { generateCharacter } from "@/lib/generate-character";
import generateCharacterPortraitUrl from "@/lib/generate-character-portrait-url/generate-character-portrait-url";
import { Character } from "@/types/character";
import { CharacterIdea } from "@/types/character-idea";
import { Story } from "@/types/story";
import { TEST_STORY } from "./generate-whole-scene/test-data";
import { logger } from "./logger";
import { chooseVoice } from "./elevenlabs/choose-voice";
import { generateVoiceSampleUrl } from "./elevenlabs/gen-voice-sample-url";

export default async function generateBulkCharactersAndPortraits({
  characterIdeas,
  story,
}: {
  characterIdeas: CharacterIdea[];
  story: Story;
}): Promise<Character[]> {
  await logger.info("Generating characters and portraits");
  const characterPromises = characterIdeas.map(async (characterIdea) => {
    const character = await generateCharacter({
      characterIdea,
      story,
    });
    await logger.info("Generated character", { character });
    const portraitUrl = await generateCharacterPortraitUrl(character);
    await logger.info(`Generated portrait for "${character.displayName}"`, {
      portraitUrl,
    });

    const voiceId = await chooseVoice(character);
    await logger.info(`Chose voice for "${character.displayName}"`, {
      voiceId,
    });

    const voiceSampleUrl = await generateVoiceSampleUrl({ character, voiceId });
    await logger.info(`Generated voice sample for "${character.displayName}"`, {
      voiceSampleUrl,
    });

    return await insertCharacter({
      ...character,
      portraitUrl,
      storyId: story.id,
      voiceId,
      voiceSampleUrl,
    });
  });

  return Promise.all(characterPromises);
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

