import saveImage from "@/db/save-image";
import { CharacterPreSave } from "@/types/character";
import { v4 as uuidv4 } from "uuid";
import generateImage from "../generate-image";
import { generateCharacterImagePrompt } from "./gen-character-image-prompt";

export default async function generateCharacterPortraitUrl(
  character: CharacterPreSave
): Promise<string> {
  const prompt = await generateCharacterImagePrompt(character);
  const imageUrl = await generateImage({
    aspectRatio: "2:3",
    prompt,
  });

  const publicImageUrl = await saveImage({
    url: imageUrl,
    name: uuidv4(),
    folder: "characters",
    fileExtension: "jpg",
  });
  if (!publicImageUrl) {
    throw new Error("Failed to save image.");
  }
  return publicImageUrl;
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
    relationships: [],
  };
  generateCharacterPortraitUrl(testCharacter).then(console.log);
}

