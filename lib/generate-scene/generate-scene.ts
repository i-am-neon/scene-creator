import { Scene } from "@/types/scene";
import { Story } from "@/types/story";
import generateIdeas from "./generate-ideas";
import { Character } from "@/types/character";
import { generateCharacter } from "../generate-character";
import { TEST_STORY, TEST_ELENA, TEST_THERON, TEST_MIRA } from "./test-data";

interface GenerateSceneParams {
  story: Story;
  existingCharacters: Character[];
  previousScenes: Scene[];
}

export default async function generateScene({
  story,
  existingCharacters,
  previousScenes,
}: GenerateSceneParams) {
  const ideas = await generateIdeas({
    story,
    existingCharacters,
    previousScenes,
  });
  console.log("ideas :>> ", ideas);
  const newCharacterPromises = ideas.newCharacterIdeas.map((c) =>
    generateCharacter({ characterIdea: c, story })
  );
  const newCharacters = await Promise.all(newCharacterPromises);
  console.log("newCharacters", JSON.stringify(newCharacters, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateScene({
    story: TEST_STORY,
    existingCharacters: [TEST_ELENA, TEST_THERON, TEST_MIRA],
    previousScenes: [],
  })
    .then(console.log)
    .catch(console.error);
}

