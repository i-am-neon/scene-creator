"use server";
import insertStory from "@/db/story/insert-story";
import generateBulkCharactersAndPortraits from "@/lib/gen-bulk-characters-and-portraits";
import generateStory from "@/lib/generate-story/generate-story";
import { logger } from "@/lib/logger";

export async function createStory(worldIdea: string) {
  const startTime = performance.now();

  await logger.info("");
  await logger.info("BEGIN STORY GENERATION");
  await logger.info("");

  await logger.info("Creating story", { worldIdea });
  const story = await generateStory(worldIdea);
  await logger.info("Generated story", { story });

  const createdStory = await insertStory(story);
  await logger.info("Inserted story");

  await generateBulkCharactersAndPortraits({
    characterIdeas: story.storyOverview.mainCharacterIdeas,
    story: createdStory,
  });
  await logger.info("Generated bulk characters and portraits");

  const endTime = performance.now();
  const executionTime = (endTime - startTime) / 1000;

  await logger.info("");
  await logger.info("END STORY GENERATION", {
    executionTimeSeconds: executionTime,
  });
  await logger.info("");

  return createdStory;
}
