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
  - Scene Idea should be a self-contained narrative unit that contributes to the larger story. It should have a clear beginning, middle, and end. It should be about a paragraph in length and show a clear progression of events. This will serve as a summary, so you must give ideas of what the characters do and say but do not need to write the script.
  
  # Character Guidelines
  - For newCharacterIdeas, only include NEW characters not already in existingCharacters
  - New characters should serve clear narrative purposes and complement the existing cast
  - Use existingCharacterIDsIncludedInScene to list which existing characters appear in the scene. Instead of the character's name, use their ID
  
  # Scene Requirements
  - All characters in the sceneIdea MUST be either from existingCharacters (listed in existingCharacterIDsIncludedInScene) OR be defined first in newCharacterIdeas
  - Do not introduce any characters in the sceneIdea that haven't been established`;

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
1. A scene idea that advances the plot and builds on previous events
2. New characters relevant to this scene (that complement existing characters)

# Requirements
- Character ideas MUST include any characters mentioned in History or Premise if existingCharacters is empty
- Only include NEW characters not in existingCharacters`;

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

