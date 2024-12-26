import { Story, StorySchema } from "@/types/story";
import generateStructuredData from "./generate-structured-data";
import generateImage from "./generate-image";
import saveImage from "@/db/save-image";

export default async function generateStory(
  worldIdea: string
): Promise<Omit<Story, "id" | "createdAt">> {
  const systemMessage = "Create the story for the given world idea.";
  const [story, imageUrl] = await Promise.all([
    generateStructuredData<Omit<Story, "imageUrl">>({
      systemMessage,
      prompt: worldIdea,
      schema: StorySchema.omit({ imageUrl: true }),
    }),
    generateImage({
      aspectRatio: "1:1",
      prompt: worldIdea,
    }),
  ]);
  const publicImageUrl = await saveImage({
    url: imageUrl,
    name: story.id.toString(),
    folder: "stories",
    fileExtension: "jpg",
  });
  if (!publicImageUrl) {
    throw new Error("Failed to save image.");
  }
  return { ...story, imageUrl: publicImageUrl, worldIdea };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const story = await generateStory(
    "A vast, oceanic world teeming with diverse islands, mythical creatures, powerful adventurers, and ancient mysteries, where freedom and ambition drive endless journeys and epic battles."
  );
  console.log("story", JSON.stringify(story, null, 2));
}

