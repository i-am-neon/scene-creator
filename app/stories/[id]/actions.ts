"use server";
import { readCharacters } from "@/db/character/read-characters";
import { readScenes } from "@/db/scene/read-scenes";
import readStory from "@/db/story/read-story";
import generateWholeScene from "@/lib/generate-whole-scene/generate-whole-scene";

export default async function createSceneWithCharacters(
  storyId: number
): Promise<void> {
  console.log("Creating scene with characters for story", storyId);
  const story = await readStory(storyId);
  if (!story) {
    throw new Error("Story not found");
  }
  console.log("story :>> ", story);
  const existingCharacters = await readCharacters(storyId);
  console.log("existingCharacters :>> ", existingCharacters);
  const previousScenes = await readScenes(storyId);
  console.log("previousScenes :>> ", previousScenes);
  await generateWholeScene({
    story,
    existingCharacters,
    previousScenes,
  });
}

