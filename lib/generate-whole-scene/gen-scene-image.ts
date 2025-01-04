import { z } from "zod";
import generateStructuredData from "@/lib/generate-structured-data";
import generateImage from "@/lib/generate-image";
import { Scene } from "@/types/scene";
import { logger } from "@/lib/logger";
import saveImage from "@/db/save-image";

// Schema for the image prompt
const ImagePromptSchema = z.object({
  prompt: z
    .string()
    .describe(
      "A detailed, atmospheric description that will be used to generate the scene's background image"
    ),
});

export default async function genSceneImage(
  scene: Omit<Scene, "id" | "createdAt" | "order" | "backgroundImageUrl">
): Promise<string> {
  try {
    // Generate the image prompt using Claude
    const { prompt } = await generateStructuredData({
      callName: "scene-image-prompt",
      schema: ImagePromptSchema,
      systemMessage: `You are a prompt engineer specializing in creating detailed, evocative prompts for image generation. 
Given a scene's title and description, create a rich, detailed prompt that will generate an appropriate background image.
Focus on the setting, atmosphere, and visual elements. Do not include characters in the prompt.
Use descriptive, visual language that will translate well to image generation.

The style should be consistently fantasy anime, with:
- Rich, vibrant colors and magical atmosphere
- Dramatic lighting and atmospheric effects
- Detailed environmental elements typical of fantasy anime backgrounds
- Studio Ghibli-inspired natural elements and architectural details
- Emphasis on creating depth and scale in the scene
- Clean, defined linework with painterly details
- Subtle magical elements integrated into natural settings
- Must not contain any words or text`,
      prompt: `Generate a background image prompt for this scene:
Title: ${scene.title}
Description: ${scene.description}`,
      temperature: 0.7,
    });

    // Generate the image using the prompt
    const imageUrl = await generateImage({
      prompt,
      aspectRatio: "16:9", // Widescreen aspect ratio suitable for scene backgrounds
    });

    // Save the generated image
    const savedImageUrl = await saveImage({
      url: imageUrl,
      name: `scene-${Date.now()}`,
      folder: "scenes",
      fileExtension: "jpg",
    });

    if (!savedImageUrl) {
      throw new Error("Failed to save generated image");
    }

    await logger.info("Scene image generated and saved successfully", {
      sceneTitle: scene.title,
      generatedImageUrl: imageUrl,
      savedImageUrl,
    });

    return savedImageUrl;
  } catch (error) {
    await logger.error("Failed to generate scene image", {
      sceneTitle: scene.title,
      error: error instanceof Error ? error.stack : String(error),
    });
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const testScene: Omit<
    Scene,
    "id" | "createdAt" | "order" | "backgroundImageUrl"
  > = {
    storyId: 1,
    title: "The Harbor at Dawn",
    description:
      "A peaceful morning at the harbor, where fishing boats gently rock in the morning mist. The first rays of sunlight pierce through the fog, creating a magical atmosphere as the town slowly awakens.",
    characterPositions: {
      captain: "mid-left",
      fisherman: "right",
    },
    script: [
      {
        characterName: "captain",
        text: "Another beautiful morning on the water.",
      },
      {
        characterName: "fisherman",
        text: "Aye, the tide's perfect today.",
      },
    ],
  };

  console.log("Generating scene image...");
  const imageUrl = await genSceneImage(testScene);
  console.log("Generated image URL:", imageUrl);
}

