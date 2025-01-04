import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { ZodSchema } from "zod";
import { logger } from "@/lib/logger";

export default async function generateStructuredData<T>({
  schema,
  systemMessage,
  prompt,
  temperature = 0,
}: {
  schema: ZodSchema<T>;
  systemMessage: string;
  prompt?: string;
  temperature?: number;
}): Promise<T> {
  try {
    await logger.info("Generating structured data", {
      schemaName: schema.description || "Unknown schema",
      systemMessageLength: systemMessage.length,
      promptLength: prompt?.length || 0,
      temperature,
    });

    const { object: result } = await generateObject({
      model: anthropic("claude-3-5-haiku-latest"),
      schema,
      system: systemMessage,
      prompt: prompt || "",
      temperature,
    });

    await logger.info("Generated structured data successfully", {
      resultSize: JSON.stringify(result).length,
    });

    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown error occurred while generating structured data";

    await logger.error(errorMessage, {
      error: error instanceof Error ? error.stack : String(error),
      schemaName: schema.description || "Unknown schema",
      systemMessageLength: systemMessage.length,
      promptLength: prompt?.length || 0,
      temperature,
      isZodError: error instanceof Error && "issues" in error,
      zodIssues:
        error instanceof Error && "issues" in error
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (error as any).issues
          : undefined,
      isAnthropicError: error instanceof Error && "status" in error,
    });

    throw error;
  }
}
