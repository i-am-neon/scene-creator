import { z } from "zod";
import generateStructuredData from "@/lib/generate-structured-data";
import { SceneIdea } from "@/types/scene-idea";
import generateMusic from "@/lib/gen-music";
import { logger } from "@/lib/logger";

const MusicPromptSchema = z.object({
  genre: z.string(),
  mood: z.string(),
  tempo: z.string(),
  instruments: z.string(),
  structure: z.string(),
});

export async function generateSceneMusic({
  sceneIdea,
  duration,
}: {
  sceneIdea: SceneIdea;
  duration: number;
}): Promise<string> {
  try {
    const promptData = await generateStructuredData({
      callName: "generateSceneMusicPrompt",
      schema: MusicPromptSchema,
      systemMessage: `You are a master music composer who specializes in creating evocative musical scores for scenes. 
      Analyze scene descriptions and generate appropriate musical accompaniment prompts.
      Focus on enhancing the emotional impact and narrative weight of the scene.`,
      prompt: `Create a detailed music prompt for this scene, ensuring the music enhances the emotional impact:
      ${JSON.stringify(sceneIdea, null, 2)}`,
      temperature: 0.7,
    });

    const musicPrompt = `
${promptData.genre} music that is ${promptData.mood}.
Features ${promptData.instruments}.
${promptData.tempo} tempo.
${promptData.structure}`.trim();

    const musicUrl = await generateMusic({
      prompt: musicPrompt,
      duration,
    });

    return musicUrl;
  } catch (error) {
    await logger.error("Failed to generate scene music", {
      error: error instanceof Error ? error.stack : String(error),
      sceneIdea,
    });
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      const testScene: SceneIdea = {
        sceneIdea:
          "A tense confrontation between rivals in a dimly lit ancient temple",
        newCharacterIdeas: [],
        existingCharacterIDsIncludedInScene: ["1", "2"],
      };

      const musicUrl = await generateSceneMusic({
        sceneIdea: testScene,
        duration: 10,
      });
      console.log("Generated music URL:", musicUrl);
    } catch (error) {
      console.error("Error:", error);
    }
  })();
}

