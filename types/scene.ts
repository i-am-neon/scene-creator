import { z } from "zod";

export const ScriptSchema = z.object({
  characterIds: z.array(z.number()),
  text: z.string(),
});

export const SceneSchema = z.object({
  id: z.number().optional(), // Optional for insert scenarios
  createdAt: z.string().optional(), // Optional for insert scenarios
  storyId: z.number(),
  title: z.string(),
  description: z.string(),
  order: z.number(),
  script: ScriptSchema,
});

export type Script = z.infer<typeof ScriptSchema>;
export type Scene = z.infer<typeof SceneSchema>;

