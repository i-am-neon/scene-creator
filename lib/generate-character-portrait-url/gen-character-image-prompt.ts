import { CharacterPreSave } from "@/types/character";

const BASE_PROMPT = `A waist-up, 3/4 portrait of a fantasy character. The character's waist sits at the bottom of the image.
Style is Realistic anime anime.
The character is slightly turned to the side, completely rendered with clear definition throughout the frame. The art style is highly detailed, with realistic facial features, intricate clothing textures, soft gradients, and subtle lighting effects. The character's expression is serious and intense, with focused eyes and naturally flowing hair. The background is plain white, with no additional details or vignetting effects.`;

export function generateCharacterImagePrompt(
  character: CharacterPreSave
): string {
  return `${BASE_PROMPT}\n\n${character.physicalDescription}`;
}

