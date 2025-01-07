import { z } from "zod";

const PhysicalDescriptionSchema = z.object({
  hairStyle: z.string().describe("Style, length, and texture of hair"),
  hairColor: z
    .string()
    .describe(
      "Natural or dyed hair color, including highlights or unique patterns"
    ),
  eyeColor: z.string().describe("Color and any unique characteristics of eyes"),
  skinTone: z.string().describe("Natural skin color and complexion"),
  build: z.string().describe("Body type, height, and general physique"),
  facialFeatures: z.string().describe("Shape of face, jaw, cheekbones, etc."),
  clothing: z
    .string()
    .describe("Typical attire, including style, materials, and colors"),
  accessories: z
    .string()
    .describe("Jewelry, weapons, magical items, or other carried items"),
  distinctiveFeatures: z
    .string()
    .describe(
      "Unique physical characteristics like birthmarks, tattoos, or unusual traits. Must not include any scarring or mutilation."
    ),
  posture: z
    .string()
    .describe("How they carry themselves, typical stance or movement"),
  expression: z
    .string()
    .describe("Typical facial expression, demeanor, or characteristic look"),
});

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
  physicalDescription: PhysicalDescriptionSchema,
  backstory: z.string(),
  goals: z.array(z.string()),
  relationships: z.array(z.string()),
});

export type Character = z.infer<typeof CharacterSchema>;

export type CharacterPreSave = Omit<
  Character,
  "id" | "createdAt" | "storyId" | "portraitUrl" | "voiceId" | "voiceSampleUrl"
>;

