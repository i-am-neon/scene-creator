import { CharacterPreSave } from "@/types/character";
import {
  TEST_ELENA,
  TEST_MIRA,
  TEST_THERON,
} from "../generate-whole-scene/test-data";

const BASE_PROMPT = `Waist-up character portrait, filling frame vertically with waist at bottom edge. Character faces 30 degrees left, formal standing pose. Pure white background. Studio lighting from right. Fire Emblem: Path of Radiance anime style. Clean lines, defined features, high contrast. Ultra HD quality. No props or furniture.`;

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

