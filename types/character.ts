import { z } from "zod";

export const CharacterSchema = z.object({
  id: z.number().optional(), // Optional for insert scenarios
  createdAt: z.string().optional(), // Optional for insert scenarios
  storyId: z.number(),
  portraitUrl: z.string(),
  name: z.string(),
  age: z.number(),
  gender: z.string(),
  personality: z.string(),
  backstory: z.string(),
  goals: z.array(z.string()),
  relationships: z.array(z.string()).optional(),
});

export type Character = z.infer<typeof CharacterSchema>;

