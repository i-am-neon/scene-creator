// This is for when an image prompt is considered NSFW

import { z } from "zod";
import generateStructuredData from "@/lib/generate-structured-data";
import { logger } from "@/lib/logger";

const PromptRefinementSchema = z.object({
  refinedPrompt: z
    .string()
    .describe("The safe, refined version of the input prompt"),
  reasoning: z.string().describe("Explanation of what was changed and why"),
});

export async function refinePrompt(originalPrompt: string): Promise<string> {
  try {
    const result = await generateStructuredData({
      callName: "refinePrompt",
      schema: PromptRefinementSchema,
      systemMessage: `You are an AI image prompt safety expert. Your task is to analyze image generation prompts and refine them to avoid NSFW detection while maintaining the core intent.

Key guidelines:
- Remove terms that might trigger safety filters
- Rephrase suggestive or violent content
- Maintain the original artistic intent
- Focus on positive, safe descriptions
- Use family-friendly terminology`,
      prompt: `Please refine this prompt to avoid NSFW detection while maintaining its core artistic intent: "${originalPrompt}"`,
      temperature: 0.7,
    });

    await logger.info("Prompt refinement succeeded", {
      originalPrompt,
      refinedPrompt: result.refinedPrompt,
      reasoning: result.reasoning,
    });

    return result.refinedPrompt;
  } catch (error) {
    await logger.error("Failed to refine prompt", {
      error: error instanceof Error ? error.stack : String(error),
      originalPrompt,
    });
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const result = await refinePrompt(
      "A battle-scarred warrior with blood-stained armor"
    );
    console.log("Refined prompt:", result);
  })();
}
