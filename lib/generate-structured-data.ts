import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { ZodSchema } from "zod";

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
  const { object: result } = await generateObject({
    model: anthropic("claude-3-5-haiku-latest"),
    schema,
    system: systemMessage,
    prompt: prompt || "",
    temperature,
  });
  return result;
}

