import { z } from "zod";

export const StorySchema = z.object({
  id: z.number(),
  createdAt: z.string(),
  title: z.string(),
  worldIdea: z.string(),
  worldOverview: z.object({
    history: z.string(),
  }),
  storyOverview: z.object({
    premise: z.string(),
  }),
});

export type Story = z.infer<typeof StorySchema>;
