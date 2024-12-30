import { z } from "zod";

export const CharacterSchema = z.object({
  id: z.number(),
  createdAt: z.string(),
  storyId: z.number(),
  portraitUrl: z.string(),
  voiceId: z.string(),
  displayName: z
    .string()
    .describe("usually the first name, or title followed by first/last name"),
  fullName: z.string(),
  age: z.number(),
  gender: z.enum(["male", "female", "other"]),
  personality: z.string(),
  backstory: z.string(),
  goals: z.array(z.string()),
  relationships: z.array(z.string()),
});

export type Character = z.infer<typeof CharacterSchema>;

