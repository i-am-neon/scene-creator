import generateStructuredData from "@/lib/generate-structured-data";
import { Character } from "@/types/character";
import { Scene, SceneSchema } from "@/types/scene";
import { Story } from "@/types/story";
import { TEST_ELENA, TEST_STORY, TEST_THERON, TEST_VAREN } from "./test-data";

interface GenerateSceneParams {
  story: Story;
  characters: Omit<Character, "id" | "createdAt" | "storyId" | "portraitUrl">[];
  previousScenes: Scene[];
  sceneIdea: string;
}

export default async function generateScene({
  story,
  characters,
  previousScenes,
  sceneIdea,
}: GenerateSceneParams): Promise<
  Omit<Scene, "id" | "createdAt" | "order" | "backgroundImageUrl">
> {
  const systemMessage = `You are a creative writing assistant specializing in immersive scene generation. Your role is to craft scenes that seamlessly blend dialogue, action, and narrative elements.

Key responsibilities:
- Use a third-person omniscient narrator to describe scenes, emotions, and unspoken elements
  - Unspoken elements example: Instead of having the character's text say, "*whispers to himself* I can't believe this is happening," The narrator would narrate, "<Character> whispers to himself" then the character would say, "I can't believe this is happening."
- Maintain consistent character voices and behaviors based on their established traits
- Format narration in 'Narrator: "..."' style for clear distinction from dialogue
- Weave together plot advancement, character development, and world-building
- Consider previous scenes to ensure narrative continuity
- Incorporate described scene elements while allowing for organic story flow
- Ignore the audioId field, as it's not relevant to your current task
- The character name MUST be the character's displayName!`;

  const scenePrompt = `
Story: ${JSON.stringify(story)}
Characters: ${JSON.stringify(characters)}
Previous Scenes: ${JSON.stringify(previousScenes)}
Ideas: ${JSON.stringify(sceneIdea)}
Generate a scene that incorporates these elements, using narration to enhance immersion.`;

  return generateStructuredData({
    callName: "generateScene",
    schema: SceneSchema.omit({
      id: true,
      createdAt: true,
      order: true,
      backgroundImageUrl: true,
    }),
    systemMessage,
    prompt: scenePrompt,
    temperature: 0.7,
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateScene({
    story: TEST_STORY,
    sceneIdea:
      "In a dimly lit section of the Council archives, Elena carefully examines the ancient crystal, discovering a fragment of memory that reveals a hidden schism within the Council of Seven. The memory suggests that not all council members agreed with the total magic ban, and some may have secretly preserved magical knowledge. As she decodes the cryptic vision, she's interrupted by Theron, who enters the archive section unexpectedly. Their interaction is tense and laden with unspoken connection, with Theron subtly protecting her from potential discovery while showing an unusual level of caution that hints at his deeper knowledge of her true identity.",
    characters: [TEST_ELENA, TEST_THERON, TEST_VAREN],
    previousScenes: [],
  })
    .then(console.log)
    .catch(console.error);
}

