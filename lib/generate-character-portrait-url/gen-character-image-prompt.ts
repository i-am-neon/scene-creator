import generateStructuredData from "@/lib/generate-structured-data";
import { CharacterPreSave, CharacterSchema } from "@/types/character";

const BASE_PROMPT = `A waist-up, 3/4 portrait of a fantasy character.
Style is Realistic anime anime.
The character is slightly turned to the side, completely rendered with clear definition throughout the frame. The art style is highly detailed, with realistic facial features, intricate clothing textures, soft gradients, and subtle lighting effects. The character's expression is serious and intense, with focused eyes and naturally flowing hair. The background is plain white, with no additional details or vignetting effects.`;

export async function generateCharacterImagePrompt(
  character: CharacterPreSave
): Promise<string> {
  const promptData = await generateStructuredData({
    schema: CharacterSchema,
    systemMessage: `You are a master artist's assistant, specializing in creating vivid, detailed image generation prompts. 
    Extract and elaborate on visual elements from character descriptions, including:
    - Physical attributes (height, build, distinctive features)
    - Facial details (eyes, expression, scars, markings)
    - Hair style, color, and texture
    - Skin tone and complexion
    - Clothing and accessories (materials, colors, patterns)
    - Any magical or supernatural elements
    Transform basic descriptions into rich, visual narratives that capture the character's essence.`,
    prompt: `Create a detailed physical description of this character, focusing on all visual elements that would be crucial for image generation. Include specific details about their appearance, clothing, and any unique features mentioned in their backstory:
    ${JSON.stringify(character, null, 2)}`,
    temperature: 0.7,
  });

  const characterDescription = `
${promptData.displayName} is ${promptData.age} years old, with ${promptData.backstory}
${promptData.personality}`.trim();

  return `${BASE_PROMPT}\n\n${characterDescription}`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const testCharacter: CharacterPreSave = {
    displayName: "Commander Sarah",
    fullName: "Sarah Alexandra Blackwood",
    age: 35,
    gender: "female",
    personality:
      "Stern and commanding, with a hint of warmth in her eyes. Battle-hardened but compassionate.",
    backstory:
      "A decorated military officer with distinctive silver-streaked black hair and a prominent scar across her left cheek. Known for wearing ceremonial armor with golden accents.",
    goals: ["Protect her people", "Find inner peace"],
    relationships: ["Lieutenant Marcus", "Queen Elara"],
  };

  console.log("Generating prompt for test character...");
  const prompt = await generateCharacterImagePrompt(testCharacter);
  console.log(prompt);
}

