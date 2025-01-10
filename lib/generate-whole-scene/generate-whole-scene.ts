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
import { deleteAllMyVoices } from "../elevenlabs/my-voices/delete-all-my-voices";
import { generateSceneMusic } from "./gen-scene-music";
import { addCharacterVoicesToMyVoices } from "../elevenlabs/my-voices/add-character-voices-to-my-voices";

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

  // Phase 1: Add voices and generate ideas in parallel
  const [, ideas] = await Promise.all([
    addCharacterVoicesToMyVoices({
      characters: existingCharacters,
      narratorVoiceId: story.narratorVoiceId,
    }),
    generateIdeas({ story, existingCharacters, previousScenes }),
  ]);

  await logger.info("Generated scene ideas", { ideas });

  // Phase 2: Generate characters and scene in parallel
  const [newCharacters, existingCharactersInScene] = await Promise.all([
    generateBulkCharactersAndPortraits({
      characterIdeas: ideas.newCharacterIdeas,
      story,
    }),
    Promise.resolve(
      existingCharacters.filter((c) =>
        ideas.existingCharacterIDsIncludedInScene.includes(c.id.toString())
      )
    ),
  ]);

  const charactersInScene = [...existingCharactersInScene, ...newCharacters];

  const generatedScene = await generateScene({
    story,
    characters: charactersInScene,
    previousScenes,
    sceneIdea: ideas.sceneIdea,
  });

  await logger.info("Generated scene", { generatedScene });

  // Phase 3: Generate all media in parallel
  const [orderedAudioUrls, backgroundImageUrl, backgroundAudioUrl] =
    await Promise.all([
      genScriptAudio({
        script: generatedScene.script,
        characterIds: charactersInScene.reduce(
          (acc, c) => ({ ...acc, [c.displayName]: c.id }),
          {}
        ),
        narratorVoiceId: story.narratorVoiceId,
      }),
      genSceneImage(generatedScene),
      generateSceneMusic({
        sceneIdea: ideas,
        duration: 15,
      }),
    ]);

  await logger.info("Generated media for scene", {
    audioCount: orderedAudioUrls.length,
    hasBackgroundImage: !!backgroundImageUrl,
    hasBackgroundAudio: !!backgroundAudioUrl,
  });

  // Phase 4: Insert scene and update junction table in parallel
  const scriptWithAudio = addAudioUrlsToScript(
    generatedScene.script,
    orderedAudioUrls
  );
  const [scene] = await Promise.all([
    insertScene({
      ...generatedScene,
      script: scriptWithAudio,
      order: previousScenes.length + 1,
      backgroundImageUrl,
      backgroundAudioUrl,
    }),
    deleteAllMyVoices(),
  ]);

  await updateJunctionTable({
    characterIds: charactersInScene.map((c) => c.id),
    sceneId: scene.id,
  });

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

