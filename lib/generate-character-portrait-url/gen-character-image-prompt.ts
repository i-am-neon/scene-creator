import generateStructuredData from "@/lib/generate-structured-data";
import { CharacterPreSave, CharacterSchema } from "@/types/character";
import { z } from "zod";

const BASE_PROMPT = `A waist-up, 3/4 portrait of a fantasy character. The character's waist sits at the bottom of the image.
Style is Realistic anime anime.
The character is slightly turned to the side, completely rendered with clear definition throughout the frame. The art style is highly detailed, with realistic facial features, intricate clothing textures, soft gradients, and subtle lighting effects. The character's expression is serious and intense, with focused eyes and naturally flowing hair. The background is plain white, with no additional details or vignetting effects.`;

// Schema for physical appearance details
const PhysicalDescriptionSchema = CharacterSchema.extend({
  hairStyle: z.string(),
  hairColor: z.string(),
  eyeColor: z.string(),
  skinTone: z.string(),
  build: z.string(),
  clothing: z.string(),
  distinctiveFeatures: z.string(),
});

export async function generateCharacterImagePrompt(
  character: CharacterPreSave
): Promise<string> {
  const promptData = await generateStructuredData({
    callName: "generateCharacterImagePrompt",
    schema: PhysicalDescriptionSchema,
    systemMessage: `You are a master artist's assistant, specializing in creating detailed physical descriptions for character portraits.
    
    Focus ONLY on concrete, visual elements:
    - Hair: style, length, color, texture (e.g., "long flowing silver hair with light waves")
    - Face: eye color, shape, expression (e.g., "piercing emerald eyes with a determined gaze")
    - Skin: tone, complexion (e.g., "warm olive skin")
    - Build: body type, height, posture (e.g., "tall and athletic with proud posture")
    - Clothing: specific garments, colors, materials (e.g., "fitted dark leather armor with silver accents")
    - Distinctive features: any unique visual elements (e.g., "delicate silver circlet")
    
    Rules:
    - Describe ONLY what can be seen in a portrait
    - Use specific, vivid color descriptions
    - Focus on concrete details, not personality or backstory
    - Keep descriptions concise and visual
    - Maintain a tasteful, fantasy-appropriate style
    - No scars, injuries, or dark elements
    - No abstract concepts or non-visual elements`,
    prompt: `Based on this character's basic information, create a detailed physical description focusing ONLY on visual elements that would appear in a portrait:
    ${JSON.stringify(character, null, 2)}`,
    temperature: 0.7,
  });

  const visualDescription = `
Character Details:
- Gender: ${character.gender}
- Hair: ${promptData.hairStyle}, ${promptData.hairColor}
- Eyes: ${promptData.eyeColor}
- Skin: ${promptData.skinTone}
- Build: ${promptData.build}
- Wearing: ${promptData.clothing}
${
  promptData.distinctiveFeatures
    ? `- Distinctive Features: ${promptData.distinctiveFeatures}`
    : ""
}`.trim();

  return `${BASE_PROMPT}\n\n${visualDescription}`;
}

// Test code
if (import.meta.url === `file://${process.argv[1]}`) {
  const testCharacter: CharacterPreSave = {
    displayName: "Commander Sarah",
    fullName: "Sarah Alexandra Blackwood",
    age: 35,
    gender: "female",
    personality: "Stern and commanding, with a hint of warmth in her eyes",
    backstory: "A decorated military officer who rose through the ranks",
    goals: ["Protect her people", "Find inner peace"],
    relationships: ["Lieutenant Marcus", "Queen Elara"],
  };

  console.log("Generating prompt for test character...");
  const prompt = await generateCharacterImagePrompt(testCharacter);
  console.log(prompt);
}

