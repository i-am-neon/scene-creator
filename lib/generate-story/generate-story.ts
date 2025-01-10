import saveImage from "@/db/save-image";
import { Story } from "@/types/story";
import { v4 as uuidv4 } from "uuid";
import generateImage from "../generate-image";
import generateStoryData from "./generate-story-data";
import { chooseNarratorVoice } from "../elevenlabs/choose-narrator-voice";
import { deleteAllMyVoices } from "../elevenlabs/my-voices/delete-all-my-voices";

export default async function generateStory(
  worldIdea: string
): Promise<Omit<Story, "id" | "createdAt">> {
  const [story, imageUrl] = await Promise.all([
    generateStoryData(worldIdea),
    generateImage({
      aspectRatio: "16:9",
      prompt: worldIdea,
    }),
  ]);

  const publicImageUrl = await saveImage({
    url: imageUrl,
    name: uuidv4(),
    folder: "stories",
    fileExtension: "jpg",
  });
  if (!publicImageUrl) {
    throw new Error("Failed to save image.");
  }

  const narratorVoiceId = await chooseNarratorVoice(story);

  await deleteAllMyVoices();

  return {
    ...story,
    imageUrl: publicImageUrl,
    worldIdea,
    narratorVoiceId,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const story = await generateStory(
    "A vast, oceanic world teeming with diverse islands, mythical creatures, powerful adventurers, and ancient mysteries, where freedom and ambition drive endless journeys and epic battles."
  );
  console.log("story", JSON.stringify(story, null, 2));
}

