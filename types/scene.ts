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

export const ScriptSchema = z.array(
  z.object({
    characterName: z.string(),
    text: z.string(),
    audioUrl: z.string().optional(),
  })
);
export type Script = z.infer<typeof ScriptSchema>;

export const SceneSchema = z.object({
  id: z.number(),
  createdAt: z.string(),
  storyId: z.number(),
  title: z.string(),
  description: z.string(),
  order: z.number(),
  characterPositions: CharacterPositionMapSchema,
  script: ScriptSchema,
  backgroundImageUrl: z.string(),
  backgroundAudioUrl: z.string(),
});

export type Scene = z.infer<typeof SceneSchema>;

// AI types:

const ScriptWithoutAudioSchema = z.array(
  z.object({
    characterName: z.string(),
    text: z.string(),
  })
);

export const SceneWithoutDBFieldsSchema = SceneSchema.omit({
  id: true,
  createdAt: true,
  order: true,
  backgroundImageUrl: true,
}).extend({
  script: ScriptWithoutAudioSchema,
});

export type SceneWithoutDBFields = z.infer<typeof SceneWithoutDBFieldsSchema>;

