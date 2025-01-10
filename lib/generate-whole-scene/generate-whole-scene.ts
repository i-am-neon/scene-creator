import { Character } from "@/types/character";
import { Scene, SceneWithoutDBFields } from "@/types/scene";
import { Story } from "@/types/story";
import generateBulkCharactersAndPortraits from "../gen-bulk-characters-and-portraits";
import generateIdeas from "./generate-ideas";
import generateScene from "./generate-scene";
import { TEST_ELENA, TEST_MIRA, TEST_STORY, TEST_THERON } from "./test-data";
import { insertScene } from "@/db/scene/insert-scene";
import { updateJunctionTable } from "@/db/scene-character/update-junction-table";
import { logger } from "../logger";
import genSceneImage from "./gen-scene-image";
import genScriptAudio from "../elevenlabs/gen-script-audio";
import { addCharacterVoices as addCharacterVoicesToMyVoices } from "../elevenlabs/my-voices/add-character-voices-to-my-voices";
import { deleteAllMyVoices } from "../elevenlabs/my-voices/delete-all-my-voices";
import { generateSceneMusic } from "./gen-scene-music";

interface GenerateSceneParams {
  story: Story;
  existingCharacters: Character[];
  previousScenes: Scene[];
}

function addAudioUrlsToScript(
  script: SceneWithoutDBFields["script"],
  audioUrls: string[]
): Scene["script"] {
  return script.map((line, i) => ({
    ...line,
    audioUrl: audioUrls[i],
  }));
}

export default async function generateWholeScene({
  story,
  existingCharacters,
  previousScenes,
}: GenerateSceneParams): Promise<Scene> {
  await logger.info("Generating whole scene", { storyId: story.id });

  // Add character voices so elevenlabs can use them
  await addCharacterVoicesToMyVoices(existingCharacters);

  const ideas = await generateIdeas({
    story,
    existingCharacters,
    previousScenes,
  });
  await logger.info("Generated scene ideas", { ideas });

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
  await logger.info("Generated scene", { generatedScene });

  const [orderedAudioUrls, backgroundImageUrl] = await Promise.all([
    genScriptAudio({
      script: generatedScene.script,
      characterIds: charactersInScene.reduce(
        (acc, c) => ({ ...acc, [c.displayName]: c.id }),
        {}
      ),
      narratorVoiceId: story.narratorVoiceId,
    }),
    genSceneImage(generatedScene),
  ]);
  await logger.info("Generated audio for scene", { orderedAudioUrls });

  const scriptWithAudio = addAudioUrlsToScript(
    generatedScene.script,
    orderedAudioUrls
  );

  const backgroundAudioUrl = await generateSceneMusic({
    sceneIdea: ideas,
    duration: 15,
  });

  const scene = await insertScene({
    ...generatedScene,
    script: scriptWithAudio,
    order: previousScenes.length + 1,
    backgroundImageUrl,
    backgroundAudioUrl,
  });
  await logger.info("Inserted scene", { sceneId: scene.id });

  await updateJunctionTable({
    characterIds: charactersInScene.map((c) => c.id),
    sceneId: scene.id,
  });

  // Delete all voices from "My Voices" after generating the scene - elevenlabs only allows 30.
  await deleteAllMyVoices();

  return scene;
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

