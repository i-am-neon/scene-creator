"use server";

import insertStory from "@/db/story/insert-story";
import { generateCharacter } from "@/lib/generate-character";
import generateStory from "@/lib/generate-story/generate-story";

export async function createStory(worldIdea: string) {
  "use server";
  const story = await generateStory(worldIdea);
  const createdStory = await insertStory(story);

  // generate full characters from the main character ideas in the Story
  for (const characterIdea of story.storyOverview.mainCharacterIdeas) {
    const character = await generateCharacter({
      characterIdea,
      story: createdStory,
    });
  }
}

