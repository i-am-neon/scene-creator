import { Character, CharacterSchema } from "@/types/character";
import { CharacterIdea } from "@/types/character-idea";
import { Story } from "@/types/story";
import generateStructuredData from "./generate-structured-data";

type GenerateCharacterParams = {
  characterIdea: CharacterIdea;
  story: Story;
};

export async function generateCharacter({
  characterIdea,
  story,
}: GenerateCharacterParams): Promise<
  Omit<Character, "id" | "createdAt" | "storyId" | "portraitUrl">
> {
  const systemMessage = `Generate a detailed character profile based on the character idea and world context.
Include:
- Realistic personality traits
- Compelling backstory that fits world
- Clear goals driving their actions
- Key relationships if mentioned`;

  const prompt = `# World Context
${story.worldIdea}
# Story Information
Title: ${story.title}
History: ${story.worldOverview.history}
Premise: ${story.storyOverview.premise}
# Character Idea
Name: ${characterIdea.name}
Description: ${characterIdea.description}
Generate a character profile with:
1. Name
2. Distinctive personality traits
3. Relevant backstory
4. 2-3 primary goals
5. Key relationships (if any)`;

  return generateStructuredData({
    schema: CharacterSchema.omit({
      id: true,
      createdAt: true,
      storyId: true,
      portraitUrl: true,
    }),
    systemMessage,
    prompt,
    temperature: 0.7,
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const story: Story = {
    id: 1,
    createdAt: "2024-01-01T00:00:00Z",
    title: "The Forbidden Mage",
    worldIdea:
      "In a world where magic is forbidden, a young mage discovers an ancient artifact.",
    imageUrl: "https://example.com/image.jpg",
    worldOverview: {
      history:
        "After the Cataclysm Wars, magic was outlawed by the Council of Seven. Users of magic are hunted by specialized inquisitors equipped with anti-magic technology.",
    },
    storyOverview: {
      premise:
        "Elena, a secret mage, discovers a crystal containing the memories of an ancient archmage. As she learns to harness its power, she uncovers a conspiracy within the Council itself.",
      mainCharacterIdeas: [
        {
          name: "Elena",
          description:
            "A young mage hiding her abilities while working as a scribe in the Council archives",
        },
        {
          name: "Theron",
          description:
            "A veteran inquisitor with a secret connection to Elena's past",
        },
        {
          name: "Mira",
          description:
            "A rebel mage leader fighting against the Council's oppression",
        },
      ],
    },
  };

  const character = await generateCharacter({
    characterIdea: story.storyOverview.mainCharacterIdeas[2],
    story,
  });

  console.log("character", JSON.stringify(character, null, 2));
}

