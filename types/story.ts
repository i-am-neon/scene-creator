import { z } from "zod";

export const StorySchema = z.object({
  id: z.number(),
  createdAt: z.string(),
  title: z.string(),
  worldIdea: z.string(),
  imageUrl: z.string(),
  worldOverview: z.object({
    history: z.string(),
  }),
  storyOverview: z.object({
    premise: z.string(),
    mainCharacterIdeas: z.array(z.string()).describe("1 - 3 main characters"),
  }),
});

export type Story = z.infer<typeof StorySchema>;

