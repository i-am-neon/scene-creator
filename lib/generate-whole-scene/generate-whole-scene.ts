import { Character } from "@/types/character";
import { Scene } from "@/types/scene";
import { Story } from "@/types/story";
import generateBulkCharactersAndPortraits from "../gen-bulk-characters-and-portraits";
import generateIdeas from "./generate-ideas";
import generateScene from "./generate-scene";
import { TEST_ELENA, TEST_MIRA, TEST_STORY, TEST_THERON } from "./test-data";
import { insertScene } from "@/db/scene/insert-scene";
import { updateJunctionTable } from "@/db/scene-character/update-junction-table";

interface GenerateSceneParams {
  story: Story;
  existingCharacters: Character[];
  previousScenes: Scene[];
}

export default async function generateWholeScene({
  story,
  existingCharacters,
  previousScenes,
}: GenerateSceneParams): Promise<void> {
  const ideas = await generateIdeas({
    story,
    existingCharacters,
    previousScenes,
  });
  const newCharacters = await generateBulkCharactersAndPortraits({
    characterIdeas: ideas.newCharacterIdeas,
    story,
  });

  const existingCharactersInScene: Character[] = existingCharacters.filter(
    (c) => ideas.existingCharacterIDsIncludedInScene.includes(c.id.toString())
  );

  const charactersInScene = [...existingCharactersInScene, ...newCharacters];
  const generatedScene = await generateScene({
    story,
    characters: charactersInScene,
    previousScenes,
    sceneIdea: ideas.sceneIdea,
  });

  const scene = await insertScene({
    ...generatedScene,
    order: previousScenes.length + 1,
  });

  await updateJunctionTable({
    characterIds: charactersInScene.map((c) => c.id),
    sceneId: scene.id,
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

