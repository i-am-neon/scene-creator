import { z } from "zod";
import generateStructuredData from "@/lib/generate-structured-data";
import { SceneIdea } from "@/types/scene-idea";
import generateMusic from "@/lib/gen-music";
import { logger } from "@/lib/logger";

const MusicPromptSchema = z.object({
  genre: z.string(),
  mood: z.string(),
  tempo: z.string(),
  instruments: z
    .string()
    .describe(
      "Instrumental elements only, no vocals except for ambient/atmospheric vocal elements"
    ),
  structure: z.string(),
  dynamics: z
    .string()
    .describe(
      "Volume and intensity levels appropriate for background music during dialogue"
    ),
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
      systemMessage: `You are a master composer specializing in background music and underscoring for dramatic scenes.
      Your expertise is creating instrumental music that enhances scenes without overpowering dialogue.
      Consider the emotional tone and dramatic tension while ensuring the music remains in the background.
      Any vocal elements should be minimal and atmospheric only (e.g., distant chants, wordless vocals, humming).
      Focus on instrumental arrangements that support but don't compete with dialogue.`,
      prompt: `Create a detailed music prompt for this dialogue scene, ensuring the music enhances the emotional impact while staying in the background:
      ${JSON.stringify(sceneIdea, null, 2)}`,
      temperature: 0.7,
    });

    const musicPrompt = `
Create ${promptData.genre} background music that is ${promptData.mood}.
Instrumental arrangement featuring ${promptData.instruments}.
${promptData.tempo} tempo with ${promptData.dynamics}.
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
