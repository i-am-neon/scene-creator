import { Character } from "@/types/character";
import { Scene } from "@/types/scene";
import { Story } from "@/types/story";
import generateBulkCharactersAndPortraits from "../gen-bulk-characters-and-portraits";
import generateIdeas from "./generate-ideas";
import generateScene from "./generate-scene";
import { TEST_ELENA, TEST_MIRA, TEST_STORY, TEST_THERON } from "./test-data";

interface GenerateSceneParams {
  story: Story;
  existingCharacters: Character[];
  previousScenes: Scene[];
}

export default async function generateWholeScene({
  story,
  existingCharacters,
  previousScenes,
}: GenerateSceneParams) {
  const ideas = await generateIdeas({
    story,
    existingCharacters,
    previousScenes,
  });
  const newCharacters = await generateBulkCharactersAndPortraits({
    characterIdeas: ideas.newCharacterIdeas,
    story,
  });

  const existingCharactersInScene: Omit<
    Character,
    "id" | "createdAt" | "storyId" | "portraitUrl"
  >[] = existingCharacters.filter((c) =>
    ideas.existingCharacterIDsIncludedInScene.includes(c.id.toString())
  );

  return await generateScene({
    story,
    characters: [...existingCharactersInScene, ...newCharacters],
    previousScenes,
    sceneIdea: ideas.sceneIdea,
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateWholeScene({
    story: TEST_STORY,
    existingCharacters: [TEST_ELENA, TEST_THERON, TEST_MIRA],
    previousScenes: [],
  })
    .then(console.log)
    .catch(console.error);
}

