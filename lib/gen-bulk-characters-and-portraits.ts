"use server";

import { insertCharacter } from "@/db/character/insert-character";
import { generateCharacter } from "@/lib/generate-character";
import generateCharacterPortraitUrl from "@/lib/generate-character-portrait-url/generate-character-portrait-url";
import { Character } from "@/types/character";
import { CharacterIdea } from "@/types/character-idea";
import { Story } from "@/types/story";

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

    return await insertCharacter({
      ...character,
      portraitUrl,
      storyId: story.id,
    });
  });

  return Promise.all(characterPromises);
}

