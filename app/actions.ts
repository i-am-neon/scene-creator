"use server";

import insertStory from "@/db/story/insert-story";
import generateStory from "@/lib/generate-story";

export async function createStory(worldIdea: string) {
  "use server";
  const story = await generateStory(worldIdea);
  await insertStory(story);
}
