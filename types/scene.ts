import { z } from "zod";

const CharacterPositionSchema = z.enum([
  "far-left",
  "mid-left",
  "left",
  "right",
  "mid-right",
  "far-right",
]);

const CharacterPositionMapSchema = z.record(
  z.string(),
  CharacterPositionSchema
);
export type CharacterPositionMap = z.infer<typeof CharacterPositionMapSchema>;

export const ScriptSchema = z.object({
  characterName: z.string(),
  text: z.string(),
});
export type Script = z.infer<typeof ScriptSchema>;

export const SceneSchema = z.object({
  id: z.number().optional(), // Optional for insert scenarios
  createdAt: z.string().optional(), // Optional for insert scenarios
  storyId: z.number(),
  title: z.string(),
  description: z.string(),
  order: z.number(),
  characterPositions: CharacterPositionMapSchema,
  script: ScriptSchema,
});

export type Scene = z.infer<typeof SceneSchema>;

