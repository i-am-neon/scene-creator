"use server";

import { insertCharacter } from "@/db/character/insert-character";
import insertStory from "@/db/story/insert-story";
import { generateCharacter } from "@/lib/generate-character";
import generateCharacterPortraitUrl from "@/lib/generate-character-portrait-url/generate-character-portrait-url";
import generateStory from "@/lib/generate-story/generate-story";

export async function createStory(worldIdea: string) {
  const story = await generateStory(worldIdea);
  const createdStory = await insertStory(story);
  console.log("created story");

  // generate full characters from the main character ideas in the Story
  const characterPromises = story.storyOverview.mainCharacterIdeas.map(
    async (characterIdea) => {
      console.log("generating character");

      const character = await generateCharacter({
        characterIdea,
        story: createdStory,
      });

      const imageUrl = await generateCharacterPortraitUrl(character);

      return { character, imageUrl };
    }
  );

  const generatedCharacters = await Promise.all(characterPromises);

  await Promise.all(
    generatedCharacters.map(({ character, imageUrl }) =>
      insertCharacter({
        ...character,
        portraitUrl: imageUrl,
        storyId: createdStory.id,
      })
    )
  );
}

