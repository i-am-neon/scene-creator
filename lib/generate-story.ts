import { Story, StorySchema } from "@/types/story";
import generateStructuredData from "./generate-structured-data";
import generateImage from "./generate-image";

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
  return { ...story, imageUrl, worldIdea };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const story = await generateStory(
    "A vast, oceanic world teeming with diverse islands, mythical creatures, powerful adventurers, and ancient mysteries, where freedom and ambition drive endless journeys and epic battles."
  );
  console.log("story", JSON.stringify(story, null, 2));
}

