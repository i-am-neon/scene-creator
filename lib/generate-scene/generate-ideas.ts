import { Story } from "@/types/story";
import { Character } from "@/types/character";
import { Scene } from "@/types/scene";
import { z } from "zod";
import generateStructuredData from "../generate-structured-data";

const SceneIdeaSchema = z.object({
  sceneIdea: z.string(),
  characterIdeas: z.array(z.string()),
});

interface GenerateIdeasInput {
  worldIdea: string;
  story: Story;
  existingCharacters: Character[];
  previousScenes: Scene[];
}

export default async function generateIdeas({
  worldIdea,
  story,
  existingCharacters,
  previousScenes,
}: GenerateIdeasInput): Promise<{
  sceneIdea: string;
  characterIdeas: string[];
}> {
  const systemMessage = `Generate creative and engaging scene ideas that progress the story naturally.

# Example Output
Input:
Premise: "Sarah discovers a hidden door"
existingCharacters: []

Output:
characterIdeas: [
  "Sarah - The protagonist who discovers the door",
  "Marcus - A new neighbor who knows about the door's history"
]

Note: Sarah is included since she's from Premise and existingCharacters is empty

# Writing Principles
- Advance plot and character development through meaningful interactions
- Create dramatic tension between new and existing characters
- Maintain consistency with established world rules 

# Character Guidelines
- For character ideas, ALWAYS include characters from the Premise or History if existingCharacters is empty
- For character ideas, only include NEW characters not already in existingCharacters
- New characters should serve clear narrative purposes and complement the existing cast

# Scene Requirements
- All characters in the scene idea MUST be either from existingCharacters OR be defined first in characterIdeas
- Do not introduce any characters in the scene idea that haven't been established in either existingCharacters or characterIdeas`;

  const charactersContext = existingCharacters
    .map((c) => `${c.name}: ${c.personality} - ${c.backstory}`)
    .join("\n");

  const scenesContext = previousScenes
    .map((s) => `Scene ${s.order}: ${s.title} - ${s.description}`)
    .join("\n");

  const prompt = `# Story Context
## World
${worldIdea}

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
    schema: SceneIdeaSchema,
    systemMessage,
    prompt,
    temperature: 1,
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const worldIdea =
    "A vast, oceanic world teeming with diverse islands, mythical creatures, powerful adventurers, and ancient mysteries, where freedom and ambition drive endless journeys and epic battles.";
  const story: Story = {
    id: 1,
    createdAt: "2024-02-06T10:30:00Z",
    title: "Tides of Destiny",
    worldIdea:
      "A vast, oceanic world teeming with diverse islands, mythical creatures, powerful adventurers, and ancient mysteries, where freedom and ambition drive endless journeys and epic battles.",
    worldOverview: {
      history:
        "Centuries ago, a great cataclysm shattered a unified continent into thousands of islands, forcing civilization to adapt to a maritime existence. Different island cultures emerged, developing unique magical traditions, naval technologies, and societal structures. Powerful maritime kingdoms, nomadic sea tribes, and independent island nations constantly vie for resources, territory, and mystical artifacts scattered across the oceanic realm.",
    },
    storyOverview: {
      premise:
        "A young navigator with a mysterious ancestral map seeks to uncover the legendary Nexus Islands - a mythical archipelago said to hold the power to reshape the world's destiny",
      mainCharacterIdeas: [
        "Aria Stormwind - A brilliant navigator with a rare magical ability to sense oceanic currents and hidden pathways",
        "Captain Drace Blackwater - A seasoned privateer with complex allegiances and a ship that can traverse impossible maritime routes",
        "Zara - A shapeshifting sea creature with ancient knowledge about the world's true origins",
      ],
    },
    imageUrl:
      "https://oeivscefnzpuiynswsue.supabase.co/storage/v1/object/public/images/stories/310c3571-0d9d-447a-b9e4-55dbd23162a7.jpg",
  };

  generateIdeas({
    worldIdea,
    story,
    existingCharacters: [],
    previousScenes: [],
  })
    .then(console.log)
    .catch(console.error);
}

