import saveImage from "@/db/save-image";
import { CharacterPreSave } from "@/types/character";
import { v4 as uuidv4 } from "uuid";
import generateFluxProImage from "../generate-flux-pro-image";
import { generateCharacterImagePrompt } from "./gen-character-image-prompt";
import removeImageBackground from "../remove-image-background";

export default async function generateCharacterPortraitUrl(
  character: CharacterPreSave
): Promise<string> {
  const prompt = await generateCharacterImagePrompt(character);
  const imageUrl = await generateFluxProImage({
    aspectRatio: "2:3",
    prompt,
  });

  const removedBackgroundImageUrl = await removeImageBackground({ imageUrl });

  const publicImageUrl = await saveImage({
    url: removedBackgroundImageUrl,
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
  generateCharacterPortraitUrl(testCharacter).then(console.log);
}

