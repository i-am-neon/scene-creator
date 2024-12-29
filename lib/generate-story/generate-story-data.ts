import { Story, StorySchema } from "@/types/story";
import generateStructuredData from "../generate-structured-data";

export default async function generateStoryData(
  worldIdea: string
): Promise<Omit<Story, "id" | "createdAt" | "imageUrl">> {
  const systemMessage = "Create the story for the given world idea.";
  return generateStructuredData<Omit<Story, "id" | "createdAt" | "imageUrl">>({
    systemMessage,
    prompt: worldIdea,
    schema: StorySchema.omit({ imageUrl: true }),
    temperature: 1,
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const story = await generateStoryData(
    "A vast, oceanic world teeming with diverse islands, mythical creatures, powerful adventurers, and ancient mysteries, where freedom and ambition drive endless journeys and epic battles."
  );
  console.log("story", JSON.stringify(story, null, 2));
}

