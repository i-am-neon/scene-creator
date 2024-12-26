import { Story, StorySchema } from "@/types/story";
import generateStructuredData from "./generate-structured-data";

export default async function generateStory(worldIdea: string): Promise<Story> {
  const systemMessage = "Create the story for the given world idea.";
  return await generateStructuredData<Story>({
    systemMessage,
    prompt: worldIdea,
    schema: StorySchema,
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const story = await generateStory(
    "A vast, oceanic world teeming with diverse islands, mythical creatures, powerful adventurers, and ancient mysteries, where freedom and ambition drive endless journeys and epic battles."
  );
  console.log("story", JSON.stringify(story, null, 2));
}

