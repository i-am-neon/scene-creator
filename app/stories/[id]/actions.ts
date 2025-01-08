"use server";
import { readCharacters } from "@/db/character/read-characters";
import { readScenes } from "@/db/scene/read-scenes";
import readStory from "@/db/story/read-story";
import generateWholeScene from "@/lib/generate-whole-scene/generate-whole-scene";
import { logger } from "@/lib/logger";

export default async function createSceneWithCharacters(
  storyId: number
): Promise<void> {
  const startTime = performance.now();

  await logger.info("");
  await logger.info("BEGIN SCENE GENERATION");
  await logger.info("");

  try {
    await logger.info("Creating scene with characters for story", { storyId });
    const story = await readStory(storyId);
    if (!story) {
      throw new Error("Story not found");
    }

    const existingCharacters = await readCharacters(storyId);
    await logger.info(`Existing characters (${existingCharacters.length})`, {
      existingCharacters,
    });

    const previousScenes = await readScenes(storyId);
    await logger.info("Previous scenes", { previousScenes });

    const scene = await generateWholeScene({
      story,
      existingCharacters,
      previousScenes,
    });
    await logger.info("Scene created", { sceneId: scene.id });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown error occurred while creating scene";

    await logger.error(errorMessage, {
      storyId,
      error: error instanceof Error ? error.stack : String(error),
    });
    throw error;
  }

  const endTime = performance.now();
  const executionTime = (endTime - startTime) / 1000;

  await logger.info("");
  await logger.info("END SCENE GENERATION", {
    executionTimeSeconds: executionTime,
  });
  await logger.info("");
}
