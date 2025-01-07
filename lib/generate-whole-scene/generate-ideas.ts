import { Character } from "@/types/character";
import { Scene } from "@/types/scene";
import { Story } from "@/types/story";
import generateStructuredData from "../generate-structured-data";
import { SceneIdea, SceneIdeaSchema } from "@/types/scene-idea";
import { TEST_ELENA, TEST_MIRA, TEST_STORY, TEST_THERON } from "./test-data";

interface GenerateIdeasInput {
  story: Story;
  existingCharacters: Character[];
  previousScenes: Scene[];
}

export default async function generateIdeas({
  story,
  existingCharacters,
  previousScenes,
}: GenerateIdeasInput): Promise<SceneIdea> {
  const systemMessage = `Generate creative and engaging scene ideas that progress the story naturally.

  # Writing Principles
  - Advance plot and character development through meaningful interactions
  - Create dramatic tension between new and existing characters
  - Maintain consistency with established world rules 
  - Scene Idea should be a self-contained narrative unit that contributes to the larger story. It should have a clear beginning, middle, and end. It should be about a paragraph in length and show a clear progression of events.
  
  # Character Guidelines for New Characters
  - Only create new characters in newCharacterIdeas if they will play an active role in the scene
  - IMPORTANT: Every character listed in newCharacterIdeas MUST appear and participate in the scene idea
  - If you don't plan to use a new character in the scene, do not include them in newCharacterIdeas
  - New characters should serve clear narrative purposes and complement the existing cast
  
  # Scene Requirements
  - All characters mentioned in the sceneIdea MUST be either:
    a) From existingCharacters (listed in existingCharacterIDsIncludedInScene) OR
    b) Defined first in newCharacterIdeas AND actively participating in the scene
  - The scene should include meaningful interactions between characters
  - VERIFY: Before submitting, check that every character in newCharacterIdeas appears in the scene idea`;

  const charactersContext = existingCharacters
    .map((c) => JSON.stringify(c))
    .join("\n");
  const scenesContext = previousScenes
    .map((s) => `Scene ${s.order}: ${s.title} - ${s.description}`)
    .join("\n");

  const prompt = `# Story Context
## World
${story.worldIdea}
## Basic Information
Title: ${story.title}
History: ${story.worldOverview.history}
Premise: ${story.storyOverview.premise}
## Characters
${charactersContext}
## Previous Scenes
${scenesContext}

# Generation Requirements
1. Create a scene idea that advances the plot and builds on previous events
2. Only add new characters if they will actively participate in the scene
3. Double-check: Have you included all new characters from newCharacterIdeas in the scene?`;

  return generateStructuredData({
    callName: "generateIdeas",
    schema: SceneIdeaSchema,
    systemMessage,
    prompt,
    temperature: 1,
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateIdeas({
    story: TEST_STORY,
    existingCharacters: [TEST_ELENA, TEST_THERON, TEST_MIRA],
    previousScenes: [],
  })
    .then(console.log)
    .catch(console.error);
}
