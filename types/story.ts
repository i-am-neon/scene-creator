import { z } from "zod";

export const WorldOverviewSchema = z.object({
  history: z.string(),
});

export type WorldOverview = z.infer<typeof WorldOverviewSchema>;

import { CharacterIdeaSchema } from "./character-idea";

export const StoryOverviewSchema = z.object({
  premise: z.string(),
  mainCharacterIdeas: z
    .array(CharacterIdeaSchema)
    .describe(
      "1 - 3 main characters. Each should have a unique name. Don't use generic character names like 'Aria'"
    ),
});

export type StoryOverview = z.infer<typeof StoryOverviewSchema>;

export const StorySchema = z.object({
  id: z.number(),
  createdAt: z.string(),
  title: z.string(),
  worldIdea: z.string(),
  imageUrl: z.string(),
  narratorVoiceId: z.string(),
  worldOverview: WorldOverviewSchema,
  storyOverview: StoryOverviewSchema,
});

export type Story = z.infer<typeof StorySchema>;

