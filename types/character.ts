import { z } from "zod";

export const CharacterSchema = z.object({
  id: z.number(),
  createdAt: z.string(),
  storyId: z.number(),
  portraitUrl: z.string(),
  voiceId: z.string(),
  voiceSampleUrl: z.string(),
  displayName: z
    .string()
    .describe("usually the first name, or title followed by first/last name"),
  fullName: z.string(),
  age: z.number(),
  gender: z.enum(["male", "female", "other"]),
  personality: z.string(),
  physicalDescription: z
    .string()
    .describe(
      "An in-depth description of the character's physical appearance. Include the description of their body as well as body art, clothing, accessories, etc. Should not include any scars or mutilation."
    ),
  backstory: z.string(),
  goals: z.array(z.string()),
  relationships: z.array(z.string()),
});

export type Character = z.infer<typeof CharacterSchema>;

export type CharacterPreSave = Omit<
  Character,
  "id" | "createdAt" | "storyId" | "portraitUrl" | "voiceId" | "voiceSampleUrl"
>;

