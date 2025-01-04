import generateStructuredData from "@/lib/generate-structured-data";
import { CharacterPreSave } from "@/types/character";
import { z } from "zod";
import genVoice from "./gen-voice";

const VoiceSampleSchema = z.object({
  text: z
    .string()
    .describe(
      "A single sentence voice sample that reflects the character's personality and background"
    ),
});

export async function generateVoiceSampleUrl({
  character,
  voiceId,
}: {
  character: CharacterPreSave;
  voiceId: string;
}): Promise<string> {
  const systemMessage = `You are a voice sample generator. Given a character's details, generate a single sentence that they would naturally say, reflecting their personality, background, and current role.
  
  This must only include text they are speaking, not any other context or description.`;

  const prompt = `Generate a voice sample for this character:
  Name: ${character.displayName} (${character.fullName})
  Personality: ${character.personality}
  Background: ${character.backstory}
  Current Goals: ${character.goals.join(", ")}`;

  const { text } = await generateStructuredData({
    schema: VoiceSampleSchema,
    systemMessage,
    prompt,
    temperature: 0.7,
  });

  return genVoice({ voiceId, text });
}
