import generateStructuredData from "@/lib/generate-structured-data";
import { logger } from "@/lib/logger";
import { CharacterPreSave } from "@/types/character";
import { z } from "zod";

const SpeechPromptSchema = z.object({
  systemPrompt: z.string(),
  userPrompt: z.string(),
});

type SpeechPrompt = z.infer<typeof SpeechPromptSchema>;

export default async function generateSpeechPrompt({
  text,
  character,
  isNarrator,
}: {
  text: string;
  character?: CharacterPreSave;
  isNarrator?: boolean;
}): Promise<SpeechPrompt> {
  try {
    const result = await generateStructuredData({
      callName: "generateSpeechPrompt",
      schema: SpeechPromptSchema,
      systemMessage: `You are an expert at creating prompts for AI voice generation.
      Create prompts that will help the AI understand the context and emotional state needed for the line.
      For narrators, focus on clarity, pacing, and engagement.
      For characters, incorporate their personality and current emotional state.`,
      prompt: `
      Create a system prompt and user prompt for the following line:
      
      ${isNarrator ? "NARRATOR" : "CHARACTER"} LINE: "${text}"
      
      ${
        character
          ? `
      CHARACTER INFO:
      Name: ${character.displayName}
      Personality: ${character.personality}
      Backstory: ${character.backstory}
      `
          : ""
      }
      
      Return appropriate system and user prompts that will help guide the voice generation.`,
      temperature: 0.7,
    });

    await logger.info("Speech prompts generated", {
      text: text.substring(0, 100),
      isNarrator,
      characterName: character?.displayName,
    });

    return result;
  } catch (error) {
    await logger.error("Failed to generate speech prompts", {
      error: error instanceof Error ? error.stack : String(error),
      text: text.substring(0, 100),
      isNarrator,
      characterName: character?.displayName,
    });
    throw error;
  }
}

// Test
if (import.meta.url === `file://${process.argv[1]}`) {
  const testCharacter: CharacterPreSave = {
    displayName: "Captain Marcus",
    fullName: "Marcus Alexander Blackwood",
    age: 45,
    gender: "male",
    personality:
      "Stern and commanding, with a dry sense of humor. Natural leader who inspires loyalty.",
    backstory:
      "A veteran spaceship captain with decades of experience. Known for his tactical brilliance and unwavering dedication to his crew.",
    goals: ["Protect his crew", "Complete the mission", "Maintain order"],
    relationships: ["First Officer Chen", "Engineer Rodriguez"],
    physicalDescription: {
      hairStyle: "Neatly combed back, perfectly maintained",
      hairColor: "Pure silver-white",
      eyeColor: "Sharp gray with decades of wisdom",
      skinTone: "Pale and aristocratic",
      build: "Tall and lean with an elderly yet dignified bearing",
      facialFeatures: "Distinguished aquiline features, high forehead",
      clothing:
        "Formal Council robes in deep blue and silver with subtle magical preservation runes",
      accessories:
        "Councilor's staff of office, various rings of political significance",
      distinctiveFeatures:
        "Ancient magical signet ring disguised as a Council seal",
      expression: "Carefully neutral with hints of hidden knowledge",
    },
  };

  generateSpeechPrompt({
    text: "All hands to battle stations! This is not a drill!",
    character: testCharacter,
  }).then(console.log);
}
