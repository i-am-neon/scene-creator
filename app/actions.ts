"use server";

import insertStory from "@/db/story/insert-story";
import generateBulkCharactersAndPortraits from "@/lib/gen-bulk-characters-and-portraits";
import generateStory from "@/lib/generate-story/generate-story";
import { logger } from "@/lib/logger";

export async function createStory(worldIdea: string) {
  const story = await generateStory(worldIdea);
  const createdStory = await insertStory(story);
  console.log("created story");

  await generateBulkCharactersAndPortraits({
    characterIdeas: story.storyOverview.mainCharacterIdeas,
    story: createdStory,
  });
}

export async function testLog() {
  await logger.clearLogs();
}

