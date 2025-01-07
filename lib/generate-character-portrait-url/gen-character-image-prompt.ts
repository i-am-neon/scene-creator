import { CharacterPreSave } from "@/types/character";
import { TEST_MIRA } from "../generate-whole-scene/test-data";

const BASE_PROMPT = `Portrait composition from hip level to head, hips/belt at bottom frame edge. Character faces 30 degrees left, standing formally. Pure white background. Right-side studio lighting. Realistic anime rendering. Sharp details, professional shading. Character fills full vertical frame. No cropping above hips.`;

export function generateCharacterImagePrompt(
  character: CharacterPreSave
): string {
  return `${BASE_PROMPT}

Gender: ${character.gender}
${JSON.stringify(character.physicalDescription, null, 2)}`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const res = generateCharacterImagePrompt(TEST_MIRA);
  console.log(res);
}

