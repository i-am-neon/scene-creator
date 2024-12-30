"use server";

import { insertCharacter } from "@/db/character/insert-character";
import { generateCharacter } from "@/lib/generate-character";
import generateCharacterPortraitUrl from "@/lib/generate-character-portrait-url/generate-character-portrait-url";
import { Character } from "@/types/character";
import { CharacterIdea } from "@/types/character-idea";
import { Story } from "@/types/story";
import chooseVoice from "./choose-voice/choose-voice";
import { generateVoiceSampleUrl } from "./gen-voice-sample-url";
import { TEST_STORY } from "./generate-whole-scene/test-data";

export default async function generateBulkCharactersAndPortraits({
  characterIdeas,
  story,
}: {
  characterIdeas: CharacterIdea[];
  story: Story;
}): Promise<Character[]> {
  const characterPromises = characterIdeas.map(async (characterIdea) => {
    const character = await generateCharacter({
      characterIdea,
      story,
    });
    const portraitUrl = await generateCharacterPortraitUrl(character);

    const voiceId = await chooseVoice(character);

    const voiceSampleUrl = await generateVoiceSampleUrl({ character, voiceId });

    const blah = {
      ...character,
      portraitUrl,
      storyId: story.id,
      voiceId,
      voiceSampleUrl,
    };
    console.log("blah", JSON.stringify(blah, null, 2));

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

