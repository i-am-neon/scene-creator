import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { ZodSchema } from "zod";
import { logger } from "@/lib/logger";

const DEFAULT_MAX_RETRIES = 3;
const BASE_DELAY = 1000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default async function generateStructuredData<T>({
  callName,
  schema,
  systemMessage,
  prompt,
  temperature = 0,
  maxRetries = DEFAULT_MAX_RETRIES,
}: {
  callName: string;
  schema: ZodSchema<T>;
  systemMessage: string;
  prompt?: string;
  temperature?: number;
  maxRetries?: number;
}): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const { object: result } = await generateObject({
        model: anthropic("claude-3-5-haiku-latest"),
        schema,
        system: systemMessage,
        prompt: prompt || "",
        temperature,
      });

      return result;
    } catch (error) {
      lastError = error as Error;
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown error occurred while generating structured data";

      if (attempt < maxRetries - 1) {
        const delay = BASE_DELAY * Math.pow(2, attempt);
        await logger.warn("Structured data generation failed, retrying", {
          callName,
          error: errorMessage,
          attempt: attempt + 1,
          nextAttemptDelay: delay,
          schemaName: schema.description || "Unknown schema",
          systemMessageLength: systemMessage.length,
          promptLength: prompt?.length || 0,
          temperature,
          stack: error instanceof Error ? error.stack : undefined,
          isZodError: error instanceof Error && "issues" in error,
          zodIssues:
            error instanceof Error && "issues" in error
              ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (error as any).issues
              : undefined,
          isAnthropicError: error instanceof Error && "status" in error,
        });
        await sleep(delay);
        continue;
      }

      await logger.error(errorMessage, {
        callName,
        error: error instanceof Error ? error.stack : String(error),
        attempts: attempt + 1,
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

  throw (
    lastError ||
    new Error(`Failed to generate structured data after ${maxRetries} attempts`)
  );
}

